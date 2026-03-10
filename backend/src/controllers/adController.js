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
      query.$text = { $search: search };
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
      .populate('user', 'name avatar rating city')
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
    console.log("GET ADS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch ads" });
  }
};

/* GET SINGLE AD */
export const getAdById = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)
      .populate('user', 'name email phone avatar city memberSince rating totalReviews');
    
    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    // Increment view count
    ad.views += 1;
    await ad.save();

    // Get similar ads
    const similarAds = await Ad.find({
      _id: { $ne: ad._id },
      category: ad.category,
      city: ad.city,
      isActive: true
    })
    .populate('user', 'name avatar')
    .limit(5)
    .sort({ createdAt: -1 });

    res.json({ ad, similarAds });
    
  } catch (err) {
    console.log("GET AD ERROR:", err);
    res.status(500).json({ error: "Failed to fetch ad" });
  }
};

/* CREATE AD */
export const createAd = async (req, res) => {
  try {
    const { title, description, price, category, condition, location, city, priceType } = req.body;
    const userId = req.user._id;

    let images = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "rentwala_ads"
        });
        images.push(result.secure_url);
        fs.unlinkSync(file.path);
      }
    }

    const newAd = new Ad({
      title,
      description,
      price,
      priceType,
      category,
      condition,
      location,
      city,
      images,
      user: userId
    });

    await newAd.save();

    // Populate user data before sending response
    await newAd.populate('user', 'name avatar');

    res.status(201).json(newAd);

  } catch (error) {
    console.log("CREATE AD ERROR:", error);
    res.status(500).json({ error: "Ad creation failed" });
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
    console.log("UPDATE AD ERROR:", error);
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
    console.log("DELETE AD ERROR:", error);
    res.status(500).json({ error: "Delete failed" });
  }
};

/* GET USER ADS */
export const getUserAds = async (req, res) => {
  try {
    const ads = await Ad.find({ 
      user: req.params.userId,
      isActive: true 
    })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

    res.json(ads);
    
  } catch (error) {
    console.log("GET USER ADS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch user ads" });
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
    console.log("TOGGLE SAVE ERROR:", error);
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
    console.log("GET SAVED ADS ERROR:", error);
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
    console.log("GET CATEGORIES ERROR:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};
