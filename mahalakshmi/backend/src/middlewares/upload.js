import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rentwala/ads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

const fileFilter = (_, file, cb) => {
  if (!file.mimetype.match(/^image\/(jpeg|jpg|png|webp)$/)) return cb(new Error('Only jpg, png, webp are allowed'));
  cb(null, true);
};

export const upload = multer({ storage, fileFilter, limits: { files: 5, fileSize: 5 * 1024 * 1024 } });
