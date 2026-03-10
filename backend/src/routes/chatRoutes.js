import express from "express";
import {
  getConversations,
  getConversation,
  startConversation,
  sendMessage,
  markAsRead
} from "../controllers/chatController.js";
import { protectUser } from "../middlewares/auth.js";

const router = express.Router();

router.use(protectUser);

router.get("/conversations", getConversations);
router.get("/conversations/:id", getConversation);
router.post("/conversations", startConversation);
router.post("/messages", sendMessage);
router.put("/conversations/:conversationId/read", markAsRead);

export default router;
