import express from "express";
import { getKeys, saveKeys } from "../controllers/settingsController.js";

const router = express.Router();

router.get("/keys", getKeys);
router.post("/keys", saveKeys);

export default router;
