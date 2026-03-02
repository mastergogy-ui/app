import express from 'express';
import {
  adjustUserPoints,
  closePrediction,
  createMatch,
  declareWinner,
  getAnalytics,
  listMatches,
  setUserStatus
} from '../controllers/adminController.js';
import { protectAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.use(protectAdmin);
router.get('/matches', listMatches);
router.post('/matches', createMatch);
router.patch('/matches/:matchId/close', closePrediction);
router.patch('/matches/:matchId/winner', declareWinner);
router.patch('/users/:userId/points', adjustUserPoints);
router.patch('/users/:userId/status', setUserStatus);
router.get('/analytics', getAnalytics);

export default router;
