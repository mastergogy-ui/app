
import express from "express";
import { register, login, adminLogin } from "../controllers/authController.js";
import { googleLogin } from "../controllers/googleAuthController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/admin-login", adminLogin);

/* GOOGLE LOGIN */
router.post("/google", googleLogin);

export default router;;
