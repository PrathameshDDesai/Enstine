import crypto from "crypto";
import Thread from "../models/Thread.js";
import { getIsMongoConnected } from "../config/db.js";
import { generateContent, generateContentStream, PERSONA_PROMPTS, AVAILABLE_MODELS, compareModels } from "../utils/ai.js";

const uuidv4 = () => crypto.randomUUID();

// Fallback in-memory storage if MongoDB is not connected
const memoryThreads = new Map();

// Helper Functions for Thread Management
export async function getThreadById(threadId) {
  if (getIsMongoConnected()) {
    return await Thread.findOne({ threadId });
  }
  return memoryThreads.get(threadId) || null;
}

export async function getAllThreads() {
  if (getIsMongoConnected()) {
    return await Thread.find().sort({ updatedAt: -1 });
  }
  return Array.from(memoryThreads.values()).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function createNewThread(persona = "friendly", initialTitle = "New Chat") {
  const threadId = uuidv4();
  const newThreadData = {
    threadId,
    title: initialTitle,
    persona,
    messages: [],
    updatedAt: new Date()
  };

  if (getIsMongoConnected()) {
    const threadDoc = new Thread(newThreadData);
    await threadDoc.save();
    return threadDoc;
  }

  memoryThreads.set(threadId, newThreadData);
  return newThreadData;
}

export async function addMessageToThread(threadId, role, content) {
  const msg = { role, content, timestamp: new Date() };

  if (getIsMongoConnected()) {
    const thread = await Thread.findOne({ threadId });
    if (thread) {
      thread.messages.push(msg);
      thread.updatedAt = new Date();
      if (thread.messages.length === 1 && role === "user" && thread.title === "New Chat") {
        thread.title = content.slice(0, 30) + (content.length > 30 ? "..." : "");
      }
      await thread.save();
      return thread;
    }
  } else {
    const thread = memoryThreads.get(threadId);
    if (thread) {
      thread.messages.push(msg);
      thread.updatedAt = new Date();
      if (thread.messages.length === 1 && role === "user" && thread.title === "New Chat") {
        thread.title = content.slice(0, 30) + (content.length > 30 ? "..." : "");
      }
      memoryThreads.set(threadId, thread);
      return thread;
    }
  }
  return null;
}

// Controller Actions

// Health Check
export const getHealth = (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.gemini_api_key;
  res.json({
    status: "ok",
    appName: "Enstine AI Backend",
    hasApiKey: !!apiKey,
    database: getIsMongoConnected() ? "MongoDB" : "InMemory"
  });
};

// Available Personas
export const getPersonas = (req, res) => {
  res.json({ personas: Object.keys(PERSONA_PROMPTS) });
};

// Available Models and Key Status
export const getModels = (req, res) => {
  const keyStatus = {
    gemini: !!(process.env.GEMINI_API_KEY || process.env.gemini_api_key),
    openai: !!(process.env.OPENAI_API_KEY || process.env.openai_api_key),
    deepseek: !!(process.env.DEEPSEEK_API_KEY || process.env.deepseek_api_key),
    groq: !!(process.env.GROQ_API_KEY || process.env.groq_api_key || process.env.GROQ || process.env.groq)
  };
  const modelsWithKeyStatus = AVAILABLE_MODELS.map(m => ({
    ...m,
    hasKey: !!keyStatus[m.provider]
  }));
  res.json({ models: modelsWithKeyStatus, keyStatus });
};

// Compare Models
export const compareModelsHandler = async (req, res) => {
  try {
    const { prompt, modelIds, persona = "friendly", messages = [] } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const selectedModels = modelIds && modelIds.length > 0 ? modelIds : ['gemini-3.6-flash', 'gpt-4o', 'deepseek-chat'];
    const comparison = await compareModels({ modelIds: selectedModels, prompt, messages, persona });
    res.json(comparison);
  } catch (error) {
    console.error("Comparison Error:", error);
    res.status(500).json({ error: error.message || "Error running comparison" });
  }
};

// Get All Threads
export const getChats = async (req, res) => {
  try {
    const threads = await getAllThreads();
    res.json({ threads });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create New Thread
export const createChat = async (req, res) => {
  try {
    const { persona, title } = req.body;
    const thread = await createNewThread(persona, title);
    res.json({ thread });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Thread by ID
export const getChatById = async (req, res) => {
  try {
    const thread = await getThreadById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }
    res.json({ thread });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Rename Thread
export const renameChat = async (req, res) => {
  try {
    const { title } = req.body;
    const threadId = req.params.id;

    if (getIsMongoConnected()) {
      const thread = await Thread.findOneAndUpdate(
        { threadId },
        { title, updatedAt: new Date() },
        { new: true }
      );
      return res.json({ thread });
    } else {
      const thread = memoryThreads.get(threadId);
      if (thread) {
        thread.title = title;
        thread.updatedAt = new Date();
        memoryThreads.set(threadId, thread);
        return res.json({ thread });
      }
    }
    res.status(404).json({ error: "Thread not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Thread
export const deleteChat = async (req, res) => {
  try {
    const threadId = req.params.id;
    if (getIsMongoConnected()) {
      await Thread.deleteOne({ threadId });
    } else {
      memoryThreads.delete(threadId);
    }
    res.json({ success: true, message: "Thread deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Single AI Generation
export const generateContentHandler = async (req, res) => {
  try {
    const { prompt, persona = "friendly", modelId = "gemini-3.6-flash" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const text = await generateContent({ prompt, persona, modelId });
    res.json({ text });
  } catch (error) {
    console.error("AI API Error:", error);
    res.status(500).json({ error: error.message || "Error communicating with AI API." });
  }
};

// Chat Handler
export const chatHandler = async (req, res) => {
  try {
    const { prompt, threadId, persona = "friendly", modelId = "gemini-3.6-flash" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    let thread = threadId ? await getThreadById(threadId) : null;
    if (!thread) {
      thread = await createNewThread(persona);
    }

    await addMessageToThread(thread.threadId, "user", prompt);
    thread = await getThreadById(thread.threadId);

    const historyMessages = thread.messages.slice(0, -1);
    const aiResponseText = await generateContent({
      modelId,
      messages: historyMessages,
      prompt,
      persona: thread.persona || persona
    });

    await addMessageToThread(thread.threadId, "assistant", aiResponseText);
    const updatedThread = await getThreadById(thread.threadId);

    res.json({
      threadId: thread.threadId,
      text: aiResponseText,
      thread: updatedThread
    });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to process chat response" });
  }
};

// Stream Chat Handler
export const chatStreamHandler = async (req, res) => {
  try {
    const { prompt, threadId, persona = "friendly", modelId = "gemini-3.6-flash" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    let thread = threadId ? await getThreadById(threadId) : null;
    if (!thread) {
      thread = await createNewThread(persona);
    }

    await addMessageToThread(thread.threadId, "user", prompt);
    thread = await getThreadById(thread.threadId);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.write(`data: ${JSON.stringify({ type: "threadId", threadId: thread.threadId })}\n\n`);

    const historyMessages = thread.messages.slice(0, -1);
    const stream = await generateContentStream({
      modelId,
      messages: historyMessages,
      prompt,
      persona: thread.persona || persona
    });

    let fullText = "";

    for await (const chunk of stream) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        res.write(`data: ${JSON.stringify({ type: "chunk", text: chunkText })}\n\n`);
      }
    }

    await addMessageToThread(thread.threadId, "assistant", fullText);
    res.write(`data: ${JSON.stringify({ type: "done", text: fullText })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Stream Chat Error:", error);
    res.write(`data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`);
    res.end();
  }
};
