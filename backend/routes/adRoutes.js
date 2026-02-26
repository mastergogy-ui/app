import express from "express";
import multer from "multer";
import Ad from "../models/Ad.js";
import cloudinary from "../utils/cloudinary.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.array("images", 6), async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const uploads = await Promise.all(
      files.map((file) =>
        cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString("base64")}`, {
          folder: "rentwala",
        }),
      ),
    );

    res.json({ images: uploads.map((item) => item.secure_url) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, price, category, location } = req.body;
    if (!title || !description || !category || !location?.city) {
      return res.status(400).json({ message: "title, description, category and location.city are required" });
    }

    const ad = await Ad.create({ ...req.body, price: Number(price || 0) });
    res.status(201).json(ad);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const {
      category,
      city,
      state,
      q,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const query = {};
    if (category) query.category = category;
    if (city) query["location.city"] = city;
    if (state) query["location.state"] = state;
    if (q) query.title = { $regex: q, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const safePage = Math.max(1, Number(page));
    const safeLimit = Math.min(50, Math.max(1, Number(limit)));
    const skip = (safePage - 1) * safeLimit;

    const [ads, total] = await Promise.all([
      Ad.find(query).sort(sort).skip(skip).limit(safeLimit),
      Ad.countDocuments(query),
    ]);

    res.json({ ads, total, page: safePage, pages: Math.ceil(total / safeLimit) || 1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
