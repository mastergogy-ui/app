import Ad from "../models/Ad.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* GET ALL ADS */
export const getAds = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, city, search } = req.query;
    
    let query = { isActive: true };
    if (category) query.category = category;
    if (city) query.city = city;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const ads = await Ad.find(query)
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Ad.countDocuments(query);

    res.json({
      ads,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Get ads error:", error);
    res.status(500).json({ error: "Failed to fetch ads" });
  }
};

/* GET SINGLE AD */
export const getAdById = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)
      .populate('user', 'name email phone avatar city');

    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    // Increment view count
    ad.views = (ad.views || 0) + 1;
    await ad.save();

    // Get similar ads
    const similarAds = await Ad.find({
      _id: { $ne: ad._id },
      category: ad.category,
      isActive: true
    })
    .populate('user', 'name avatar')
    .limit(5);

    res.json({ ad, similarAds });
  } catch (error) {
    console.error("Get ad by id error:", error);
    res.status(500).json({ error: "Failed to fetch ad" });
  }
};

/* CREATE AD */
export const createAd = async (req, res) => {
  try {
    const { title, description, price, category, condition, location, city } = req.body;
    const userId = req.user._id;

    let imageUrls = [];

    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "rentwala_ads",
          });
          imageUrls.push(result.secure_url);
          // Clean up temp file
          fs.unlinkSync(file.path);
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
        }
      }
    } else if (req.file) {
      // Single file upload
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "rentwala_ads",
      });
      imageUrls.push(result.secure_url);
      fs.unlinkSync(req.file.path);
    }

    const newAd = new Ad({
      title,
      description,
      price: Number(price),
      category,
      condition: condition || "Good",
      location,
      city: city || location,
      images: imageUrls,
      user: userId,
      isActive: true,
      views: 0
    });

    await newAd.save();
    
    // Populate user data before sending response
    await newAd.populate('user', 'name email avatar');

    res.status(201).json(newAd);
  } catch (error) {
    console.error("Create ad error:", error);
    res.status(500).json({ error: "Failed to create ad" });
  }
};

/* GET USER ADS */
export const getUserAds = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    
    const ads = await Ad.find({ 
      user: userId,
      isActive: true 
    })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

    res.json(ads);
  } catch (error) {
    console.error("Get user ads error:", error);
    res.status(500).json({ error: "Failed to fetch user ads" });
  }
};

/* DELETE AD */
export const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    // Check if user owns the ad
    if (ad.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Soft delete
    ad.isActive = false;
    await ad.save();

    res.json({ message: "Ad deleted successfully" });
  } catch (error) {
    console.error("Delete ad error:", error);
    res.status(500).json({ error: "Failed to delete ad" });
  }
};
