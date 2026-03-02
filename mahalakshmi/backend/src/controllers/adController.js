import { Ad } from '../models/Ad.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createAd = asyncHandler(async (req, res) => {
  const images = (req.files || []).map((f) => f.path);
  if (images.length > 5) throw new ApiError(400, 'Maximum 5 images');
  const ad = await Ad.create({ ...req.body, location: JSON.parse(req.body.location), images, user: req.user._id });
  res.status(201).json(ad);
});

export const getAds = asyncHandler(async (req, res) => {
  const { page = 1, category, location, q } = req.query;
  const query = {};
  if (category) query.category = category;
  if (location) query['location.city'] = new RegExp(location, 'i');
  if (q) query.$text = { $search: q };
  const limit = 10;
  const ads = await Ad.find(query)
    .populate('user', 'name profileImage')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * limit)
    .limit(limit)
    .lean();
  const total = await Ad.countDocuments(query);
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ ads, total, page: Number(page), pages: Math.ceil(total / limit) });
});

export const getAdById = asyncHandler(async (req, res) => {
  const ad = await Ad.findById(req.params.id).populate('user', 'name email phone profileImage');
  if (!ad) throw new ApiError(404, 'Ad not found');
  res.json(ad);
});

export const updateAd = asyncHandler(async (req, res) => {
  const ad = await Ad.findById(req.params.id);
  if (!ad) throw new ApiError(404, 'Ad not found');
  if (ad.user.toString() !== req.user.id) throw new ApiError(403, 'Forbidden');
  const payload = { ...req.body };
  if (payload.location) payload.location = JSON.parse(payload.location);
  if (req.files?.length) payload.images = req.files.map((f) => f.path);
  const updated = await Ad.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  res.json(updated);
});

export const deleteAd = asyncHandler(async (req, res) => {
  const ad = await Ad.findById(req.params.id);
  if (!ad) throw new ApiError(404, 'Ad not found');
  if (ad.user.toString() !== req.user.id) throw new ApiError(403, 'Forbidden');
  await ad.deleteOne();
  res.json({ message: 'Ad deleted' });
});

export const myAds = asyncHandler(async (req, res) => {
  const ads = await Ad.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(ads);
});
