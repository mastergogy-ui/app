import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
  if (!token) throw new ApiError(401, 'Not authorized');
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, 'User not found');
  req.user = user;
  next();
});
