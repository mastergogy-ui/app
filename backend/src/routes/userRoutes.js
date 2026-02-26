import { Router } from 'express';
import { updateProfile } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();
router.put('/profile', protect, updateProfile);

export default router;
