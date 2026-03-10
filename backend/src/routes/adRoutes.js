import express from "express";
import { createAd, getAds } from "../controllers/adController.js";
import multer from "multer";

const router = express.Router();

/* TEMP STORAGE FOR CLOUDINARY */
const upload = multer({ dest: "temp/" });

/* CREATE AD */
router.post("/", upload.single("image"), createAd);

/* GET ALL ADS */
router.get("/", getAds);

export default router;
