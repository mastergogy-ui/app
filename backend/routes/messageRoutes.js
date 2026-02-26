import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const message = await Message.create(req.body);
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:adId", async (req, res) => {
  try {
    const messages = await Message.find({ ad: req.params.adId }).sort("createdAt");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
