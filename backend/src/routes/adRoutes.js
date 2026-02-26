import { Router } from 'express';
import { createAd, deleteAd, getAdById, getAds, myAds, updateAd } from '../controllers/adController.js';
import { protect } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();
router.get('/', getAds);
router.get('/mine', protect, myAds);
router.get('/:id', getAdById);
router.post('/', protect, upload.array('images', 5), createAd);
router.put('/:id', protect, upload.array('images', 5), updateAd);
router.delete('/:id', protect, deleteAd);

export default router;
