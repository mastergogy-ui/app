import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, profileImage } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, phone, profileImage }, { new: true, runValidators: true });
  res.json(user);
});
