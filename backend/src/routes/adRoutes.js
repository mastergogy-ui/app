
import express from "express";
import multer from "multer";
import { getAds, createAd } from "../controllers/adController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("/", getAds);

router.post("/", upload.single("image"), async (req, res) => {
  try {
    await createAd(req, res);
  } catch (error) {
    console.log("CREATE AD ERROR:", error);
    res.status(500).json({ error: "Failed to create ad" });
  }
});

export default router;
