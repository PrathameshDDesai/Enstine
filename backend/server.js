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

// Server Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Enstine MVC Backend running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
