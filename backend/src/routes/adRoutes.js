
import express from "express";
import multer from "multer";
import { getAds, createAd } from "../controllers/adController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("/", getAds);

router.post("/", upload.single("image"), createAd);

export default router;
