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
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
  }
});

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Make io accessible */
app.set('io', io);

/* ROUTES */
app.use("/api/ads", adRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

/* SOCKET.IO */
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

export { app, httpServer, io };
