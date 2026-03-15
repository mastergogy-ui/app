import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

import adRoutes from "./routes/adRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

/* =========================
   CORS CONFIGURATION
========================= */

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://maha-front.onrender.com",
  "https://mahafront.vercel.app",
  "http://localhost:3000"
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow tools like Postman or server requests
      if (!origin) return callback(null, true);

      // allow exact origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // allow Vercel preview deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      // allow Render deployments
      if (origin.endsWith(".onrender.com")) {
        return callback(null, true);
      }

      console.log("⚠️ CORS allowed for:", origin);
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.options("*", cors());

/* =========================
   BODY PARSER
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   SOCKET.IO SETUP
========================= */

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

app.set("io", io);

/* =========================
   ROOT ROUTE
========================= */

app.get("/", (req, res) => {
  res.json({
    message: "RentWala API is running",
    status: "healthy",
    endpoints: {
      auth: "/api/auth",
      ads: "/api/ads",
      user: "/api/user",
      chat: "/api/chat"
    }
  });
});

/* =========================
   HEALTH CHECK
========================= */

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

/* =========================
   ROUTES
========================= */

app.use("/api/ads", adRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.url}`
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message
  });
});

/* =========================
   SOCKET CONNECTION
========================= */

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("join-user", (userId) => {
    if (userId) {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

/* =========================
   DATABASE CONNECTION
========================= */

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in environment variables");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    httpServer.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
