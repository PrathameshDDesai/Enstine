import express from "express";
import {
  getHealth,
  getPersonas,
  getModels,
  compareModelsHandler,
  getChats,
  createChat,
  getChatById,
  renameChat,
  deleteChat,
  generateContentHandler,
  chatHandler,
  chatStreamHandler
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/health", getHealth);
router.get("/personas", getPersonas);
router.get("/models", getModels);
router.post("/chat/compare", compareModelsHandler);
router.get("/chats", getChats);
router.post("/chats", createChat);
router.get("/chats/:id", getChatById);
router.patch("/chats/:id", renameChat);
router.delete("/chats/:id", deleteChat);
router.post("/generate", generateContentHandler);
router.post("/chat", chatHandler);
router.post("/chat/stream", chatStreamHandler);

export default router;
