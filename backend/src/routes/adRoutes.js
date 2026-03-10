
import express from "express";
import multer from "multer";
import { getAds, createAd } from "../controllers/adController.js";

const router = express.Router();

/* MULTER CONFIG */
const upload = multer({
  dest: "uploads/",
});

/* GET ALL ADS */
router.get("/", async (req, res) => {
  try {
    const ads = await getAds(req, res);

    // Always send array
    if (!Array.isArray(ads)) {
      return res.json([]);
    }

    res.json(ads);
  } catch (error) {
    console.log("GET ADS ERROR:", error);
    res.json([]);
  }
});

/* CREATE AD */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const ad = await createAd(req, res);
    res.json(ad);
  } catch (error) {
    console.log("CREATE AD ERROR:", error);
    res.status(500).json({ error: "Failed to create ad" });
  }
});

export default router;
