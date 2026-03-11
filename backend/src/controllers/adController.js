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

/* GET SINGLE AD - ENHANCED WITH DEBUG */
export const getAdById = async (req, res) => {
  try {
    const adId = req.params.id;
    console.log("🔍 ===== GET AD BY ID CALLED =====");
    console.log("🔍 Looking for ad with ID:", adId);
    console.log("🔍 ID type:", typeof adId);
    console.log("🔍 ID length:", adId.length);
    
    // Validate ID format
    if (!adId || adId.length < 10) {
      console.log("❌ Invalid ID format:", adId);
      return res.status(400).json({ error: "Invalid ad ID format" });
    }
    
    // Try to find the ad
    const ad = await Ad.findById(adId)
      .populate('user', 'name email phone avatar city memberSince');
    
    if (!ad) {
      console.log("❌ Ad not found with ID:", adId);
      
      // Try to find all ads to debug (limit to 5)
      const allAds = await Ad.find({}).limit(5).select('_id title');
      console.log("📊 Sample of recent ads in DB:", allAds.map(a => ({ 
        id: a._id.toString(), 
        title: a.title 
      })));
      
      return res.status(404).json({ error: "Ad not found" });
    }

    console.log("✅ Ad found:", ad._id.toString(), ad.title);
    console.log("✅ Ad user:", ad.user?._id?.toString());
    console.log("✅ Ad images:", ad.images?.length || 0);

    // Increment view count
    ad.views = (ad.views || 0) + 1;
    await ad.save();
    console.log("✅ View count incremented to:", ad.views);

    // Get similar ads
    const similarAds = await Ad.find({
      _id: { $ne: ad._id },
      category: ad.category,
      isActive: true
    })
    .populate('user', 'name avatar')
    .limit(5)
    .sort({ createdAt: -1 });

    console.log(`✅ Found ${similarAds.length} similar ads`);

    res.json({ ad, similarAds });
    
  } catch (err) {
    console.error("❌ GET AD ERROR:", err);
    console.error("❌ Error stack:", err.stack);
    res.status(500).json({ error: "Failed to fetch ad" });
  }
};

/* CREATE AD */
export const createAd = async (req, res) => {
  try {
    const { title, description, price, category, condition, location, city } = req.body;
    const userId = req.user._id;

    console.log("🔍 ===== CREATE AD CALLED =====");
    console.log("🔍 Creating ad for user:", userId);
    console.log("🔍 Ad data:", { title, description, price, category, location });

    let imageUrls = [];

    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
      console.log(`🔍 Uploading ${req.files.length} images...`);
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "rentwala_ads",
          });
          imageUrls.push(result.secure_url);
          fs.unlinkSync(file.path);
          console.log("✅ Image uploaded:", result.secure_url);
        } catch (uploadError) {
          console.error("❌ Cloudinary upload error:", uploadError);
        }
      }
    } else if (req.file) {
      // Single file upload
      console.log("🔍 Uploading single image...");
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "rentwala_ads",
      });
      imageUrls.push(result.secure_url);
      fs.unlinkSync(req.file.path);
      console.log("✅ Image uploaded:", result.secure_url);
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
    console.log("✅ Ad created successfully with ID:", newAd._id.toString());
    
    // Populate user data before sending response
    await newAd.populate('user', 'name email avatar');

    res.status(201).json(newAd);
    
  } catch (error) {
    console.error("❌ CREATE AD ERROR:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ error: "Failed to create ad" });
  }
};

/* UPDATE AD */
export const updateAd = async (req, res) => {
  try {
    const adId = req.params.id;
    console.log("🔍 ===== UPDATE AD CALLED =====");
    console.log("🔍 Updating ad:", adId);
    
    const ad = await Ad.findById(adId);
    
    if (!ad) {
      console.log("❌ Ad not found for update:", adId);
      return res.status(404).json({ error: "Ad not found" });
    }

    // Check ownership
    if (ad.user.toString() !== req.user._id.toString()) {
      console.log("❌ Unauthorized update attempt by user:", req.user._id);
      return res.status(403).json({ error: "Not authorized" });
    }

    const updatedAd = await Ad.findByIdAndUpdate(
      adId,
      { $set: req.body },
      { new: true }
    ).populate('user', 'name avatar');

    console.log("✅ Ad updated successfully:", adId);
    res.json(updatedAd);
    
  } catch (error) {
    console.error("❌ UPDATE AD ERROR:", error);
    res.status(500).json({ error: "Update failed" });
  }
};

/* DELETE AD */
export const deleteAd = async (req, res) => {
  try {
    const adId = req.params.id;
    console.log("🔍 ===== DELETE AD CALLED =====");
    console.log("🔍 Deleting ad:", adId);
    
    const ad = await Ad.findById(adId);
    
    if (!ad) {
      console.log("❌ Ad not found for delete:", adId);
      return res.status(404).json({ error: "Ad not found" });
    }

    // Check ownership
    if (ad.user.toString() !== req.user._id.toString()) {
      console.log("❌ Unauthorized delete attempt by user:", req.user._id);
      return res.status(403).json({ error: "Not authorized" });
    }

    // Soft delete
    ad.isActive = false;
    await ad.save();

    console.log("✅ Ad soft deleted successfully:", adId);
    res.json({ message: "Ad deleted successfully" });
    
  } catch (error) {
    console.error("❌ DELETE AD ERROR:", error);
    res.status(500).json({ error: "Delete failed" });
  }
};

/* ===== FIXED: GET USER ADS - Handles "me" parameter correctly ===== */
export const getUserAds = async (req, res) => {
  try {
    console.log("🔍 ===== GET USER ADS CALLED =====");
    console.log("🔍 req.params.userId:", req.params.userId);
    console.log("🔍 req.user:", req.user ? req.user._id : 'No authenticated user');
    
    let userId;
    
    // Check if the parameter is "me" and use the authenticated user's ID
    if (req.params.userId === 'me') {
      if (!req.user) {
        console.log("❌ No authenticated user found for 'me' request");
        return res.status(401).json({ error: "Authentication required" });
      }
      userId = req.user._id;
      console.log("🔍 Using authenticated user ID for 'me':", userId);
    } else {
      userId = req.params.userId;
      console.log("🔍 Using provided user ID:", userId);
    }
    
    // Validate that userId exists
    if (!userId) {
      console.log("❌ No user ID provided");
      return res.status(400).json({ error: "User ID is required" });
    }
    
    // Find all ads by this user
    console.log("🔍 Searching for ads with user ID:", userId);
    const ads = await Ad.find({ 
      user: userId,
      isActive: true 
    })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

    console.log(`✅ Found ${ads.length} ads for user ${userId}`);
    res.json(ads);
    
  } catch (error) {
    console.error("❌ GET USER ADS ERROR:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ error: "Failed to fetch user ads" });
  }
};

/* GET USER'S OWN ADS - ENHANCED WITH DEBUG */
export const getMyAds = async (req, res) => {
  try {
    console.log("🔍 ===== GET MY ADS CALLED =====");
    console.log("🔍 User ID from token:", req.user._id);
    
    if (!req.user || !req.user._id) {
      console.log("❌ No authenticated user");
      return res.status(401).json({ error: "Authentication required" });
    }
    
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
    if (ads.length > 0) {
      console.log("📊 First ad:", { 
        id: ads[0]._id.toString(), 
        title: ads[0].title,
        created: ads[0].createdAt 
      });
    }
    
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
    
    console.log("🔍 ===== TOGGLE SAVE AD CALLED =====");
    console.log("🔍 User:", userId, "Ad:", id);

    const saved = await SavedAd.findOne({ user: userId, ad: id });

    if (saved) {
      await saved.deleteOne();
      console.log("✅ Ad unsaved:", id);
      res.json({ saved: false });
    } else {
      await SavedAd.create({ user: userId, ad: id });
      console.log("✅ Ad saved:", id);
      res.json({ saved: true });
    }
    
  } catch (error) {
    console.error("❌ TOGGLE SAVE ERROR:", error);
    res.status(500).json({ error: "Failed to save ad" });
  }
};

/* GET SAVED ADS */
export const getSavedAds = async (req, res) => {
  try {
    console.log("🔍 ===== GET SAVED ADS CALLED =====");
    console.log("🔍 User:", req.user._id);
    
    const saved = await SavedAd.find({ user: req.user._id })
      .populate({
        path: 'ad',
        populate: { path: 'user', select: 'name avatar' }
      })
      .sort({ createdAt: -1 });

    const ads = saved.filter(s => s.ad && s.ad.isActive).map(s => s.ad);
    console.log(`✅ Found ${ads.length} saved ads for user ${req.user._id}`);
    
    res.json(ads);
    
  } catch (error) {
    console.error("❌ GET SAVED ADS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch saved ads" });
  }
};

/* GET CATEGORIES WITH COUNTS */
export const getCategories = async (req, res) => {
  try {
    console.log("🔍 ===== GET CATEGORIES CALLED =====");
    
    const categories = await Ad.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log(`✅ Found ${categories.length} categories`);
    res.json(categories);
    
  } catch (error) {
    console.error("❌ GET CATEGORIES ERROR:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

/* INCREMENT VIEW COUNT */
export const incrementViews = async (req, res) => {
  try {
    const adId = req.params.id;
    console.log("🔍 ===== INCREMENT VIEWS CALLED =====");
    console.log("🔍 Ad:", adId);
    
    const ad = await Ad.findById(adId);
    if (ad) {
      ad.views = (ad.views || 0) + 1;
      await ad.save();
      console.log("✅ Views incremented to:", ad.views);
    }
    res.json({ success: true });
    
  } catch (error) {
    console.error("❌ INCREMENT VIEWS ERROR:", error);
    res.status(500).json({ error: "Failed to increment views" });
  }
};
