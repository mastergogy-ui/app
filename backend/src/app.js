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

// Get allowed origins from environment variable or use defaults
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const allowedOrigins = [
  CLIENT_URL,
  "http://localhost:3000"
].filter(Boolean);

// Array of allowed origins
const allowedOrigins = [
  CLIENT_URL,
  VERCEL_URL,
  "http://localhost:3000"
].filter(Boolean); // Remove any undefined values

console.log("🔍 Allowed CORS origins:", allowedOrigins);

// Socket.io with CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  }
});

// Express CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      console.log("✅ Request with no origin allowed");
      return callback(null, true);
    }
    
    // Check if the origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ Origin allowed: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ Origin blocked: ${origin}`);
      console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Make io accessible */
app.set('io', io);

/* Health check route */
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Server is running",
    cors: {
      allowedOrigins,
      clientUrl: CLIENT_URL
    }
  });
});

/* ROUTES */
app.use("/api/ads", adRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

/* SOCKET.IO */
io.on('connection', (socket) => {
  console.log('🔌 New client connected');
  
  socket.on('join-user', (userId) => {
    console.log(`👤 User ${userId} joined their room`);
    socket.join(`user-${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected');
  });
});

export { app, httpServer, io };
