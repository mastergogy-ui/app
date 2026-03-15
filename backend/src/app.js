import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import adRoutes from "./routes/adRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();
const httpServer = createServer(app);

/* =========================
   ALLOWED ORIGINS
========================= */

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const allowedOrigins = [
  CLIENT_URL,
  "http://localhost:3000",
  "https://mahafront.vercel.app",
  "https://mahalakshmi.onrender.com"
].filter(Boolean);

console.log("🔍 Allowed CORS origins:", allowedOrigins);

/* =========================
   SOCKET.IO SETUP
========================= */

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

/* =========================
   EXPRESS CORS
========================= */

app.use(
  cors({
    origin: function (origin, callback) {

      /* allow server-to-server / postman requests */
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        console.log("✅ Allowed Origin:", origin);
        return callback(null, true);
      }

      console.log("⚠️ CORS allowed anyway:", origin);
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* handle preflight requests */
app.options("*", cors());

/* =========================
   BODY PARSERS
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   MAKE SOCKET AVAILABLE
========================= */

app.set("io", io);

/* =========================
   HEALTH CHECK
========================= */

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server running",
    cors: allowedOrigins
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
   SOCKET CONNECTION
========================= */

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("join-user", (userId) => {
    console.log(`👤 User joined room user-${userId}`);
    socket.join(`user-${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

/* =========================
   EXPORTS
========================= */

export { app, httpServer, io };
