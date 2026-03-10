import express from "express";
import { register, login, getMe, updateProfile } from "../controllers/authController.js";
import { googleLogin } from "../controllers/googleAuthController.js";
import { protectUser } from "../middlewares/auth.js";

const router = express.Router();

/* PUBLIC ROUTES */
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);

/* PROTECTED ROUTES */
router.get("/me", protectUser, getMe);
router.put("/profile", protectUser, updateProfile);

export default router;
