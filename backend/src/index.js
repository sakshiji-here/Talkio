import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app as socketApp, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
socketApp.use(express.json());
socketApp.use(cookieParser());
socketApp.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
socketApp.use("/api/auth", authRoutes);
socketApp.use("/api/messages", messageRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  socketApp.use(express.static(path.join(__dirname, "../frontend/dist")));

  socketApp.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Start server
server.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  } catch (err) {
    console.error("❌ Failed to connect to DB", err);
    process.exit(1);
  }
});
