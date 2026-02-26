import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendAuthCookie, signToken } from '../utils/token.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !password || (!email && !phone)) throw new ApiError(400, 'name, password and email/phone are required');
  if (email && (await User.findOne({ email }))) throw new ApiError(409, 'Email already in use');
  if (phone && (await User.findOne({ phone }))) throw new ApiError(409, 'Phone already in use');
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, phone, password: hashedPassword });
  const token = signToken(user._id);
  sendAuthCookie(res, token);
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone } });
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const query = identifier.includes('@') ? { email: identifier } : { phone: identifier };
  const user = await User.findOne(query).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) throw new ApiError(401, 'Invalid credentials');
  const token = signToken(user._id);
  sendAuthCookie(res, token);
  res.json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone, profileImage: user.profileImage } });
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw new ApiError(400, 'idToken required');
  const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  let user = await User.findOne({ googleId: payload.sub });
  if (!user) {
    user = await User.create({
      name: payload.name,
      email: payload.email,
      googleId: payload.sub,
      profileImage: payload.picture
    });
  }
  const token = signToken(user._id);
  sendAuthCookie(res, token);
  res.json({ user });
});

export const me = asyncHandler(async (req, res) => res.json({ user: req.user }));

export const logout = asyncHandler(async (_, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});
