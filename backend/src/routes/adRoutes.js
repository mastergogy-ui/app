import express from "express";
import { 
  createAd, 
  getAds, 
  getAdById,
  updateAd, 
  deleteAd,
  getUserAds,
  toggleSaveAd,
  getSavedAds,
  getCategories
} from "../controllers/adController.js";
import { protectUser } from "../middlewares/auth.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "temp/" });

/* PUBLIC ROUTES */
router.get("/", getAds);
router.get("/categories", getCategories);
router.get("/:id", getAdById);
router.get("/user/:userId", getUserAds);

/* PROTECTED ROUTES */
router.post("/", protectUser, upload.array("images", 8), createAd);
router.put("/:id", protectUser, upload.array("images", 8), updateAd);
router.delete("/:id", protectUser, deleteAd);
router.post("/:id/save", protectUser, toggleSaveAd);
router.get("/saved/me", protectUser, getSavedAds);

export default router;
