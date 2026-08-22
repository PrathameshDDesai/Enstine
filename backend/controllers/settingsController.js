import fs from "fs";
import path from "path";
import { refreshAiClient } from "../utils/ai.js";

// Mask key for UI security
function maskKey(key) {
  if (!key) return "";
  if (key.length <= 8) return "••••••••";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}

// Get configured API Keys (masked)
export const getKeys = (req, res) => {
  const keys = {
    gemini: maskKey(process.env.GEMINI_API_KEY || process.env.gemini_api_key),
    openai: maskKey(process.env.OPENAI_API_KEY || process.env.openai_api_key),
    deepseek: maskKey(process.env.DEEPSEEK_API_KEY || process.env.deepseek_api_key),
    groq: maskKey(process.env.GROQ_API_KEY || process.env.groq_api_key || process.env.GROQ || process.env.groq)
  };
  const keyStatus = {
    gemini: !!(process.env.GEMINI_API_KEY || process.env.gemini_api_key),
    openai: !!(process.env.OPENAI_API_KEY || process.env.openai_api_key),
    deepseek: !!(process.env.DEEPSEEK_API_KEY || process.env.deepseek_api_key),
    groq: !!(process.env.GROQ_API_KEY || process.env.groq_api_key || process.env.GROQ || process.env.groq)
  };
  res.json({ keys, keyStatus });
};

// Save API Keys dynamically
export const saveKeys = async (req, res) => {
  try {
    const { gemini, openai, deepseek, groq } = req.body;
    const envPath = path.join(process.cwd(), ".env");
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

    const updateEnvVar = (varName, value) => {
      if (value === undefined) return;
      if (value && value.includes("••••")) return; // Skip masked string
      process.env[varName] = value || "";
      const regex = new RegExp(`^${varName}\\s*=.*$`, "m");
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${varName} = ${value || ""}`);
      } else {
        envContent += `\n${varName} = ${value || ""}`;
      }
    };

    if (gemini !== undefined) updateEnvVar("GEMINI_API_KEY", gemini);
    if (openai !== undefined) updateEnvVar("OPENAI_API_KEY", openai);
    if (deepseek !== undefined) updateEnvVar("DEEPSEEK_API_KEY", deepseek);
    if (groq !== undefined) updateEnvVar("GROQ_API_KEY", groq);

    fs.writeFileSync(envPath, envContent.trim() + "\n");
    refreshAiClient();

    const keyStatus = {
      gemini: !!(process.env.GEMINI_API_KEY || process.env.gemini_api_key),
      openai: !!(process.env.OPENAI_API_KEY || process.env.openai_api_key),
      deepseek: !!(process.env.DEEPSEEK_API_KEY || process.env.deepseek_api_key),
      groq: !!(process.env.GROQ_API_KEY || process.env.groq_api_key || process.env.GROQ || process.env.groq)
    };

    res.json({ success: true, message: "API keys updated successfully!", keyStatus });
  } catch (error) {
    console.error("Error saving API keys:", error);
    res.status(500).json({ error: error.message || "Failed to save API keys" });
  }
};
