import express from "express";
import Ad from "../models/Ad.js";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, async (_req, res) => {
  try {
    const [users, ads] = await Promise.all([User.countDocuments(), Ad.countDocuments()]);
    res.json({ users, ads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
