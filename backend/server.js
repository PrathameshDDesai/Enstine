import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import chatRoutes from "./routes/chatRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// API Routes
app.use("/api", chatRoutes);
app.use("/api/settings", settingsRoutes);

// Serve Static Frontend (Vite build) when available
const frontendDistPath = path.join(process.cwd(), "../frontend/dist");
const localDistPath = path.join(process.cwd(), "dist");

if (fs.existsSync(frontendDistPath)) {
  console.log("📦 Serving frontend build from ../frontend/dist");
  app.use(express.static(frontendDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else if (fs.existsSync(localDistPath)) {
  console.log("📦 Serving frontend build from ./dist");
  app.use(express.static(localDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(localDistPath, "index.html"));
  });
}

// Server Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Enstine Full-Stack Application running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
