import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

export let ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.gemini_api_key || "" });

export function refreshAiClient() {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.gemini_api_key || "";
  ai = new GoogleGenAI({ apiKey: geminiKey });
}

const getGeminiKey = () => process.env.GEMINI_API_KEY || process.env.gemini_api_key;
const getOpenAIKey = () => process.env.OPENAI_API_KEY || process.env.openai_api_key;
const getDeepSeekKey = () => process.env.DEEPSEEK_API_KEY || process.env.deepseek_api_key;
const getGroqKey = () => process.env.GROQ_API_KEY || process.env.groq_api_key || process.env.GROQ || process.env.groq;

// Catalog of supported AI models across providers
export const AVAILABLE_MODELS = [
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'gemini', badge: '🌟 Google Gemini', desc: 'Fast, highly intelligent multimodal AI' },
  { id: 'gpt-4o', name: 'ChatGPT GPT-4o', provider: 'openai', badge: '🤖 OpenAI ChatGPT', desc: 'Flagship high-intelligence GPT model' },
  { id: 'gpt-4o-mini', name: 'ChatGPT 4o Mini', provider: 'openai', badge: '⚡ OpenAI ChatGPT', desc: 'Fast & lightweight GPT model' },
  { id: 'deepseek-chat', name: 'DeepSeek V3', provider: 'deepseek', badge: '🧠 DeepSeek AI', desc: 'Advanced reasoning & full-stack code' },
  { id: 'deepseek-reasoner', name: 'DeepSeek R1', provider: 'deepseek', badge: '🔬 DeepSeek AI', desc: 'Deep step-by-step reasoning AI' },
  { id: 'groq/compound', name: 'Groq Compound', provider: 'groq', badge: '⚡ Groq AI', desc: 'Ultra-fast compound reasoning model' },
  { id: 'groq/compound-mini', name: 'Groq Compound Mini', provider: 'groq', badge: '⚡ Groq AI', desc: 'Lightning-fast compact Groq model' },
  { id: 'qwen/qwen3.6-27b', name: 'Qwen 3.6 27B', provider: 'groq', badge: '⚡ Groq AI', desc: 'High intelligence Qwen model on Groq' }
];

// System Prompts for different Enstine personas
export const PERSONA_PROMPTS = {
  friendly: `You are Enstine, a warm, energetic, empathetic, and delightfully friendly AI companion. 
Your primary goal is to make the user feel heard, supported, and inspired.
- Always address the user in a cheerful, respectful, and engaging tone.
- Use natural conversation, pleasant formatting, clear explanations, and friendly emojis where appropriate.
- Be highly helpful, intelligent, and proactive with thoughtful answers.
- If asking follow-ups, keep them encouraging and open-ended.
- Always identify yourself proudly as Enstine when asked!`,

  genius: `You are Enstine, a brilliant, quick-witted, and deeply knowledgeable AI genius.
- Provide clear, highly insightful, structured, and precise answers.
- Break down complex topics into easy-to-understand concepts using vivid analogies.
- Maintain a warm, encouraging tone while showing remarkable intellectual depth.`,

  coder: `You are Enstine, an expert full-stack developer and software architect.
- Provide clean, robust, modern, production-grade code snippets with clear line explanations.
- Follow best practices, design patterns, and emphasize clean readable code.
- Be friendly, encouraging, and helpful when helping debug or build software.`,

  creative: `You are Enstine, an imaginative creative assistant, storyteller, and ideation partner.
- Be expressive, poetic, inventive, and inspiring in your responses.
- Help brainstorm rich ideas, compelling copy, stories, and unique visual concepts.`
};

/**
 * Format conversation history for Gemini API
 */
function formatGeminiHistory(messages = []) {
  return messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
}

/**
 * Format conversation history for OpenAI / DeepSeek API
 */
function formatOpenAIHistory(messages = [], prompt = '', systemInstruction = '') {
  const formatted = [];
  if (systemInstruction) {
    formatted.push({ role: 'system', content: systemInstruction });
  }
  for (const msg of messages) {
    formatted.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    });
  }
  if (prompt) {
    formatted.push({ role: 'user', content: prompt });
  }
  return formatted;
}

const FALLBACK_GEMINI_MODELS = Array.from(new Set([
  process.env.GEMINI_MODEL,
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest"
].filter(Boolean)));

/**
 * Call OpenAI ChatGPT API
 */
async function callOpenAI({ model = 'gpt-4o-mini', messages, prompt, persona }) {
  const apiKey = getOpenAIKey();
  if (!apiKey) {
    return `⚠️ **OpenAI API Key Required**\n\nTo use ChatGPT (${model}), please set your \`OPENAI_API_KEY\` in Settings.\n\n*Currently running in preview mode.*`;
  }
  const systemInstruction = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.friendly;
  const formattedMessages = formatOpenAIHistory(messages, prompt, systemInstruction);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: formattedMessages,
      temperature: 0.7
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `OpenAI API error: ${res.statusText}`);
  }
  return data.choices[0]?.message?.content || "";
}

/**
 * Call DeepSeek API
 */
async function callDeepSeek({ model = 'deepseek-chat', messages, prompt, persona }) {
  const apiKey = getDeepSeekKey();
  if (!apiKey) {
    return `⚠️ **DeepSeek API Key Required**\n\nTo use DeepSeek (${model}), please set your \`DEEPSEEK_API_KEY\` in Settings.\n\n*Currently running in preview mode.*`;
  }
  const systemInstruction = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.friendly;
  const formattedMessages = formatOpenAIHistory(messages, prompt, systemInstruction);

  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: formattedMessages,
      temperature: 0.7
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `DeepSeek API error: ${res.statusText}`);
  }
  return data.choices[0]?.message?.content || "";
}

/**
 * Call Groq API
 */
async function callGroq({ model = 'groq/compound', messages, prompt, persona }) {
  const apiKey = getGroqKey();
  if (!apiKey) {
    return `⚠️ **Groq API Key Required**\n\nTo use Groq (${model}), please set your \`GROQ_API_KEY\` in Settings.\n\n*Currently running in preview mode.*`;
  }
  const systemInstruction = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.friendly;
  const formattedMessages = formatOpenAIHistory(messages, prompt, systemInstruction);

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: formattedMessages,
      temperature: 0.7
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `Groq API error: ${res.statusText}`);
  }
  return data.choices[0]?.message?.content || "";
}


/**
 * Call Gemini API
 */
async function callGemini({ model = 'gemini-3.6-flash', messages, prompt, persona }) {
  const systemInstruction = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.friendly;
  let contents = [];
  if (messages && messages.length > 0) {
    contents = formatGeminiHistory(messages);
  }
  if (prompt) {
    contents.push({ role: 'user', parts: [{ text: prompt }] });
  }

  const modelList = [model, ...FALLBACK_GEMINI_MODELS];
  let lastError = null;

  for (const m of Array.from(new Set(modelList))) {
    try {
      const response = await ai.models.generateContent({
        model: m,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });
      return response.text;
    } catch (err) {
      console.warn(`Gemini Model ${m} failed: ${err.message}. Trying next fallback...`);
      lastError = err;
    }
  }

  throw lastError || new Error("Gemini API request failed.");
}

/**
 * Single AI Content Generation Router
 */
export async function generateContent({ modelId = 'gemini-3.6-flash', messages, prompt, persona = 'friendly' }) {
  const modelMeta = AVAILABLE_MODELS.find(m => m.id === modelId) || AVAILABLE_MODELS[0];
  const provider = modelMeta.provider;

  if (provider === 'openai') {
    return await callOpenAI({ model: modelMeta.id, messages, prompt, persona });
  } else if (provider === 'deepseek') {
    return await callDeepSeek({ model: modelMeta.id, messages, prompt, persona });
  } else if (provider === 'groq') {
    return await callGroq({ model: modelMeta.id, messages, prompt, persona });
  } else {
    return await callGemini({ model: modelMeta.id, messages, prompt, persona });
  }
}

/**
 * Stream Content Generation Router (Gemini native stream, or simulated chunk stream for OpenAI/DeepSeek)
 */
export async function generateContentStream({ modelId = 'gemini-3.6-flash', messages, prompt, persona = 'friendly' }) {
  const modelMeta = AVAILABLE_MODELS.find(m => m.id === modelId) || AVAILABLE_MODELS[0];
  const provider = modelMeta.provider;

  if (provider === 'gemini') {
    const systemInstruction = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.friendly;
    let contents = [];
    if (messages && messages.length > 0) {
      contents = formatGeminiHistory(messages);
    }
    if (prompt) {
      contents.push({ role: 'user', parts: [{ text: prompt }] });
    }
    return await ai.models.generateContentStream({
      model: modelMeta.id || 'gemini-3.6-flash',
      contents: contents,
      config: { systemInstruction, temperature: 0.7 }
    });
  } else {
    // Non-Gemini providers: get full text and return async generator chunking it
    const text = await generateContent({ modelId, messages, prompt, persona });
    return (async function* () {
      const words = text.split(" ");
      let current = "";
      for (let i = 0; i < words.length; i += 3) {
        const chunk = words.slice(i, i + 3).join(" ") + " ";
        yield { text: chunk };
      }
    })();
  }
}

/**
 * Compare multiple AI models simultaneously
 */
export async function compareModels({ modelIds = ['gemini-3.6-flash', 'gpt-4o', 'deepseek-chat'], prompt, messages, persona = 'friendly' }) {
  const startTime = Date.now();

  const results = await Promise.all(
    modelIds.map(async (id) => {
      const modelMeta = AVAILABLE_MODELS.find(m => m.id === id) || { id, name: id, provider: 'custom', badge: id };
      const modelStart = Date.now();
      try {
        const text = await generateContent({ modelId: id, messages, prompt, persona });
        const durationMs = Date.now() - modelStart;
        return {
          modelId: id,
          name: modelMeta.name,
          provider: modelMeta.provider,
          badge: modelMeta.badge,
          status: 'success',
          text,
          latencyMs: durationMs
        };
      } catch (err) {
        return {
          modelId: id,
          name: modelMeta.name,
          provider: modelMeta.provider,
          badge: modelMeta.badge,
          status: 'error',
          error: err.message,
          latencyMs: Date.now() - modelStart
        };
      }
    })
  );

  return {
    prompt,
    totalTimeMs: Date.now() - startTime,
    results
  };
}
