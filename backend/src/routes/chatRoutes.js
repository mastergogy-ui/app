import express from "express";
import {
  getConversations,
  getConversation,
  startConversation,
  sendMessage,
  markAsRead,
  getUnreadCount  // 👈 ADDED
} from "../controllers/chatController.js";
import { protectUser } from "../middlewares/auth.js";

const router = express.Router();

// All chat routes require authentication
router.use(protectUser);

router.get("/conversations", getConversations);
router.get("/conversations/:id", getConversation);
router.post("/conversations", startConversation);
router.post("/messages", sendMessage);
router.put("/conversations/:conversationId/read", markAsRead);
router.get("/unread", getUnreadCount);  // 👈 ADDED

export default router;
