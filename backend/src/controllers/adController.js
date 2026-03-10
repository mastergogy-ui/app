import Ad from "../models/Ad.js";
import { v2 as cloudinary } from "cloudinary";

/* CLOUDINARY CONFIG */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* GET ADS */
export const getAds = async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    console.log("GET ADS ERROR:", err);
    res.json([]);
  }
};

/* CREATE AD */
export const createAd = async (req, res) => {
  try {
    const { title, description, price } = req.body;

    let imageUrl = "";

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "rentwala_ads"
      });

      imageUrl = upload.secure_url;
    }

    const ad = await Ad.create({
      title,
      description,
      price,
      image: imageUrl
    });

    res.json(ad);
  } catch (error) {
    console.log("CREATE AD ERROR:", error);
    res.status(500).json({ error: "Failed to create ad" });
  }
};
