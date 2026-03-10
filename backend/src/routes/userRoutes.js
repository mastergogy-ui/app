import express from 'express';
import {
  getDashboard,
  getProfile,
  updateProfile,
  getPublicProfile
} from '../controllers/userController.js';
import { protectUser } from '../middlewares/auth.js';

const router = express.Router();

router.get('/profile/:userId', getPublicProfile);

router.use(protectUser);
router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
