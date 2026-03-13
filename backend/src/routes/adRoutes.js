import express from "express";
import { 
  createAd, 
  getAds, 
  getAdById,
  updateAd, 
  deleteAd,
  getUserAds,
  getMyAds,
  toggleSaveAd,
  getSavedAds,
  getCategories,
  incrementViews
} from "../controllers/adController.js";
import { protectUser } from "../middlewares/auth.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "temp/" });

/* PUBLIC ROUTES */
router.get("/", getAds);
router.get("/categories", getCategories);
router.get("/:id", getAdById);
router.post("/:id/view", incrementViews);

/* IMPORTANT: ORDER MATTERS - SPECIFIC ROUTES FIRST */
router.get("/user/me", protectUser, getMyAds);        // This MUST come before /user/:userId
router.get("/user/:userId", getUserAds);               // This is for public profiles

/* PROTECTED ROUTES - Require authentication */
router.post("/", protectUser, upload.array("images", 8), createAd);
router.put("/:id", protectUser, upload.array("newImages", 8), updateAd); // Changed to "newImages" to match frontend
router.delete("/:id", protectUser, deleteAd);
router.post("/:id/save", protectUser, toggleSaveAd);
router.get("/saved/me", protectUser, getSavedAds);

export default router;
