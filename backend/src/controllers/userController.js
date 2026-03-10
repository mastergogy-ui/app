import User from '../models/User.js';
import Ad from '../models/Ad.js';
import SavedAd from '../models/SavedAd.js';
import Conversation from '../models/Conversation.js';

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [myAds, savedAds, conversations, unreadCount] = await Promise.all([
      Ad.find({ user: userId, isActive: true }).sort({ createdAt: -1 }).limit(10),
      SavedAd.find({ user: userId }).populate('ad').limit(10),
      Conversation.find({ participants: userId, isActive: true })
        .populate('participants', 'name avatar')
        .populate('ad', 'title images')
        .sort({ lastMessageAt: -1 })
        .limit(10),
      Message.countDocuments({
        conversation: { $in: await Conversation.find({ participants: userId }).distinct('_id') },
        sender: { $ne: userId },
        readBy: { $ne: userId }
      })
    ]);

    res.json({
      user: req.user,
      myAds: myAds.filter(ad => ad),
      savedAds: savedAds.map(s => s.ad).filter(ad => ad && ad.isActive),
      conversations,
      unreadCount,
      stats: {
        totalAds: await Ad.countDocuments({ user: userId, isActive: true }),
        totalViews: await Ad.aggregate([
          { $match: { user: userId, isActive: true } },
          { $group: { _id: null, total: { $sum: "$views" } } }
        ]).then(r => r[0]?.total || 0)
      }
    });
    
  } catch (error) {
    console.log("DASHBOARD ERROR:", error);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const profile = await User.findById(req.user._id).select('-password');
    res.json(profile);
  } catch (error) {
    console.log("PROFILE ERROR:", error);
    res.status(500).json({ message: 'Failed to load profile' });
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

export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name avatar city memberSince rating totalReviews');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userAds = await Ad.find({ user: user._id, isActive: true })
      .select('title price images createdAt views')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ user, ads: userAds });
    
  } catch (error) {
    console.log("PUBLIC PROFILE ERROR:", error);
    res.status(500).json({ message: 'Failed to load profile' });
  }
};
