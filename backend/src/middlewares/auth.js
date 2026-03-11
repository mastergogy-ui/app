import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getToken = (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.split(' ')[1];
};

export const protectUser = async (req, res, next) => {
  try {
    console.log("🔍 ===== AUTH MIDDLEWARE =====");
    console.log("🔍 Headers authorization:", req.headers.authorization ? 'Present' : 'Missing');
    
    const token = getToken(req);
    
    if (!token) {
      console.log("❌ No token found in request");
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    
    console.log("🔍 Token extracted, length:", token.length);
    console.log("🔍 Token preview:", token.substring(0, 15) + '...');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🔍 Token verified successfully");
      console.log("🔍 Decoded user ID:", decoded.id);
      
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log("❌ User not found with ID:", decoded.id);
        return res.status(401).json({ message: 'User not found' });
      }

      console.log("✅ User authenticated:", user.email);
      console.log("✅ User ID:", user._id.toString());

      if (!user.isActive || user.isBanned) {
        console.log("❌ User account is disabled:", user.email);
        return res.status(403).json({ message: 'Account is disabled' });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      console.error("❌ JWT Verification failed:", jwtError.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    console.error("❌ AUTH MIDDLEWARE ERROR:", error);
    res.status(500).json({ message: 'Server error in authentication' });
  }
};
