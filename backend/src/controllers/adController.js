import Ad from "../models/Ad.js";
import User from "../models/User.js";
import SavedAd from "../models/SavedAd.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* GET ALL ADS with filters */
export const getAds = async (req, res) => {
  try {
    const { 
      category, 
      city, 
      minPrice, 
      maxPrice, 
      search, 
      sort = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    let query = { isActive: true };
    
    if (category) query.category = category;
    if (city) query.city = city;
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = {};
    switch(sort) {
      case 'newest': sortOption = { createdAt: -1 }; break;
      case 'oldest': sortOption = { createdAt: 1 }; break;
      case 'price_low': sortOption = { price: 1 }; break;
      case 'price_high': sortOption = { price: -1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const ads = await Ad.find(query)
      .populate('user', 'name email avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Ad.countDocuments(query);

    res.json({
      ads,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
    
  } catch (err) {
    console.error("GET ADS ERROR:", err);
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
    .limit(5)
    .sort({ createdAt: -1 });

    res.json({ ad, similarAds });
    
  } catch (err) {
    console.error("GET AD ERROR:", err);
    res.status(500).json({ error: "Failed to fetch ad" });
  }
};

/* CREATE AD */
export const createAd = async (req, res) => {
  try {
    const { title, description, price, category, condition, location, city } = req.body;
    const userId = req.user._id;

    console.log("Creating ad for user:", userId);
    console.log("Ad data:", { title, description, price, category, location });

    let imageUrls = [];

    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "rentwala_ads",
          });
          imageUrls.push(result.secure_url);
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
    console.log("Ad created successfully with ID:", newAd._id);
    
    // Populate user data before sending response
    await newAd.populate('user', 'name email avatar');

    res.status(201).json(newAd);
    
  } catch (error) {
    console.error("CREATE AD ERROR:", error);
    res.status(500).json({ error: "Failed to create ad" });
  }
};

/* UPDATE AD */
export const updateAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    // Check ownership
    if (ad.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updatedAd = await Ad.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('user', 'name avatar');

    res.json(updatedAd);
    
  } catch (error) {
    console.error("UPDATE AD ERROR:", error);
    res.status(500).json({ error: "Update failed" });
  }
};

/* DELETE AD */
export const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    // Check ownership
    if (ad.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Soft delete
    ad.isActive = false;
    await ad.save();

    res.json({ message: "Ad deleted successfully" });
    
  } catch (error) {
    console.error("DELETE AD ERROR:", error);
    res.status(500).json({ error: "Delete failed" });
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
    console.error("GET USER ADS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch user ads" });
  }
};

/* GET USER'S OWN ADS - ENHANCED WITH DEBUG */
export const getMyAds = async (req, res) => {
  try {
    console.log("🔍 ===== GET MY ADS CALLED =====");
    console.log("🔍 User ID from token:", req.user._id);
    console.log("🔍 User object:", req.user);
    
    // First check if user exists in database
    const userExists = await User.findById(req.user._id);
    if (!userExists) {
      console.log("❌ User not found in database:", req.user._id);
      return res.status(404).json({ error: "User not found" });
    }
    console.log("✅ User found:", userExists.email);
    
    // Find all ads by this user
    console.log("🔍 Searching for ads with user ID:", req.user._id);
    const ads = await Ad.find({ 
      user: req.user._id,
      isActive: true 
    })
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 });

    console.log(`✅ Found ${ads.length} ads for user ${req.user._id}`);
    console.log("📊 Ads data:", JSON.stringify(ads, null, 2));
    
    // Always return array, even if empty
    res.status(200).json(ads);
    
  } catch (error) {
    console.error("❌ GET MY ADS ERROR:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ error: "Failed to fetch your ads" });
  }
};

/* SAVE/UNSAVE AD */
export const toggleSaveAd = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const saved = await SavedAd.findOne({ user: userId, ad: id });

    if (saved) {
      await saved.deleteOne();
      res.json({ saved: false });
    } else {
      await SavedAd.create({ user: userId, ad: id });
      res.json({ saved: true });
    }
    
  } catch (error) {
    console.error("TOGGLE SAVE ERROR:", error);
    res.status(500).json({ error: "Failed to save ad" });
  }
};

/* GET SAVED ADS */
export const getSavedAds = async (req, res) => {
  try {
    const saved = await SavedAd.find({ user: req.user._id })
      .populate({
        path: 'ad',
        populate: { path: 'user', select: 'name avatar' }
      })
      .sort({ createdAt: -1 });

    const ads = saved.filter(s => s.ad && s.ad.isActive).map(s => s.ad);
    res.json(ads);
    
  } catch (error) {
    console.error("GET SAVED ADS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch saved ads" });
  }
};

/* GET CATEGORIES WITH COUNTS */
export const getCategories = async (req, res) => {
  try {
    const categories = await Ad.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(categories);
    
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

/* INCREMENT VIEW COUNT */
export const incrementViews = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (ad) {
      ad.views = (ad.views || 0) + 1;
      await ad.save();
    }
    res.json({ success: true });
  } catch (error) {
    console.error("INCREMENT VIEWS ERROR:", error);
    res.status(500).json({ error: "Failed to increment views" });
  }
};
