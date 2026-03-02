import Admin from '../models/Admin.js';
import User from '../models/User.js';
import { signToken } from '../utils/token.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, password });
  res.status(201).json({
    token: signToken(user._id, 'user'),
    user: { id: user._id, name: user.name, email: user.email, points: user.points }
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  if (!user.isActive || user.isBanned) return res.status(403).json({ message: 'User disabled' });

  res.json({
    token: signToken(user._id, 'user'),
    user: { id: user._id, name: user.name, email: user.email, points: user.points }
  });
};

export const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username }).select('+password');
  if (!admin || !(await admin.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  res.json({ token: signToken(admin._id, 'admin'), admin: { id: admin._id, username: admin.username } });
};
