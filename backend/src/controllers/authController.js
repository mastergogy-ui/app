import User from '../models/User.js';
import { signToken } from '../utils/token.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, city } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({ 
      name, 
      email, 
      password,
      phone,
      city 
    });

    const token = signToken(user._id, 'user');

    res.status(201).json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        avatar: user.avatar,
        phone: user.phone,
        city: user.city,
        memberSince: user.memberSince
      }
    });
    
  } catch (error) {
    console.log("REGISTER ERROR:", error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    if (!user.isActive || user.isBanned) {
      return res.status(403).json({ message: 'Account is disabled' });
    }

    const token = signToken(user._id, 'user');

    res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        avatar: user.avatar,
        phone: user.phone,
        city: user.city,
        memberSince: user.memberSince
      }
    });
    
  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.log("GET ME ERROR:", error);
    res.status(500).json({ message: 'Failed to get user' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, city } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (city) user.city = city;
    
    await user.save();
    
    res.json({ 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      avatar: user.avatar,
      phone: user.phone,
      city: user.city,
      memberSince: user.memberSince
    });
    
  } catch (error) {
    console.log("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ message: 'Update failed' });
  }
};
