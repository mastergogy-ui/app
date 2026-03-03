import express from 'express';
import {
  createPrediction,
  getDashboard,
  getLeaderboard,
  getMatchHistory,
  getProfile
} from '../controllers/userController.js';
import { protectUser } from '../middlewares/auth.js';

const router = express.Router();

router.use(protectUser);
router.get('/dashboard', getDashboard);
router.post('/predict', createPrediction);
router.get('/history', getMatchHistory);
router.get('/leaderboard', getLeaderboard);
router.get('/profile', getProfile);

export default router;
