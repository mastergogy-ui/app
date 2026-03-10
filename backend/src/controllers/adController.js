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
    const { title, description, price, location } = req.body;

    let imageUrl = "";

    /* Upload to Cloudinary if image exists */
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "rentwala_ads"
      });

      imageUrl = result.secure_url;
    }

    const newAd = new Ad({
      title,
      description,
      price,
      location,
      image: imageUrl
    });

    await newAd.save();

    res.json(newAd);

  } catch (error) {
    console.log("CREATE AD ERROR:", error);
    res.status(500).json({ error: "Ad creation failed" });
  }
};
