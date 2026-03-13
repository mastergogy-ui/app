import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Ad from "../models/Ad.js";
import User from "../models/User.js";

/* GET USER CONVERSATIONS */
export const getConversations = async (req, res) => {
  try {
    console.log("🔍 ===== GET CONVERSATIONS CALLED =====");
    console.log("🔍 User ID:", req.user._id);
    
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    })
    .populate('participants', 'name avatar')
    .populate('ad', 'title images price')
    .populate('lastMessageSender', 'name')
    .sort({ lastMessageAt: -1 });

    console.log(`✅ Found ${conversations.length} conversations`);

    // Reset unread count when user views inbox
    await User.findByIdAndUpdate(req.user._id, { unreadCount: 0 });
    
    res.json(conversations);
    
  } catch (error) {
    console.error("❌ GET CONVERSATIONS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

/* GET SINGLE CONVERSATION WITH MESSAGES */
export const getConversation = async (req, res) => {
  try {
    console.log("🔍 ===== GET CONVERSATION CALLED =====");
    console.log("🔍 Conversation ID:", req.params.id);
    console.log("🔍 User ID:", req.user._id);
    
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'name avatar')
      .populate('ad', 'title images price user');

    if (!conversation) {
      console.log("❌ Conversation not found");
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      p => p._id.toString() === req.user._id.toString()
    );
    
    if (!isParticipant) {
      console.log("❌ User not authorized for this conversation");
      return res.status(403).json({ error: "Not authorized" });
    }

    console.log("✅ Conversation found, fetching messages...");
    
    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark messages as read and update unread count
    const result = await Message.updateMany(
      { 
        conversation: req.params.id, 
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      },
      { $addToSet: { readBy: req.user._id } }
    );

    // If there were unread messages, recalculate total unread count
    if (result.modifiedCount > 0) {
      // Get all conversations for this user
      const userConversations = await Conversation.find({
        participants: req.user._id
      }).select('_id');
      
      const conversationIds = userConversations.map(c => c._id);
      
      // Count all unread messages across all conversations
      const totalUnread = await Message.countDocuments({
        conversation: { $in: conversationIds },
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      });
      
      await User.findByIdAndUpdate(req.user._id, { unreadCount: totalUnread });
    }

    console.log(`✅ Found ${messages.length} messages`);
    res.json({ conversation, messages });
    
  } catch (error) {
    console.error("❌ GET CONVERSATION ERROR:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};

/* START NEW CONVERSATION */
export const startConversation = async (req, res) => {
  try {
    const { adId, message } = req.body;
    console.log("🔍 ===== START CONVERSATION CALLED =====");
    console.log("🔍 Ad ID:", adId);
    console.log("🔍 User ID:", req.user._id);
    console.log("🔍 Message:", message);
    
    const ad = await Ad.findById(adId);
    if (!ad) {
      console.log("❌ Ad not found");
      return res.status(404).json({ error: "Ad not found" });
    }

    console.log("✅ Ad found, seller ID:", ad.user);

    // Don't let user message themselves
    if (ad.user.toString() === req.user._id.toString()) {
      console.log("❌ Cannot message yourself");
      return res.status(400).json({ error: "Cannot message yourself" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, ad.user] },
      ad: adId
    });

    if (!conversation) {
      console.log("📝 Creating new conversation...");
      conversation = await Conversation.create({
        participants: [req.user._id, ad.user],
        ad: adId,
        lastMessage: message,
        lastMessageSender: req.user._id
      });
      console.log("✅ Created new conversation:", conversation._id);
    } else {
      console.log("✅ Found existing conversation:", conversation._id);
    }

    // Create first message
    const newMessage = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text: message,
      readBy: [req.user._id]
    });

    // Update conversation last message
    conversation.lastMessage = message;
    conversation.lastMessageAt = new Date();
    conversation.lastMessageSender = req.user._id;
    await conversation.save();

    await conversation.populate('participants', 'name avatar');
    await conversation.populate('ad', 'title images price');

    // Emit socket event
    const io = req.app.get('io');
    conversation.participants.forEach(participant => {
      const participantId = participant._id?.toString() || participant.toString();
      if (participantId !== req.user._id.toString()) {
        console.log(`📨 Emitting to user-${participantId}`);
        io.to(`user-${participantId}`).emit('new-conversation', {
          conversation,
          message: newMessage
        });
      }
    });

    console.log("✅ Conversation started successfully");
    res.status(201).json({ conversation, message: newMessage });
    
  } catch (error) {
    console.error("❌ START CONVERSATION ERROR:", error);
    res.status(500).json({ error: "Failed to start conversation" });
  }
};

/* SEND MESSAGE - UPDATED with unread count */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    console.log("🔍 ===== SEND MESSAGE CALLED =====");
    console.log("🔍 Conversation ID:", conversationId);
    console.log("🔍 User ID:", req.user._id);
    console.log("🔍 Message:", text);

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.log("❌ Conversation not found");
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );
    
    if (!isParticipant) {
      console.log("❌ User not authorized");
      return res.status(403).json({ error: "Not authorized" });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text,
      readBy: [req.user._id]
    });

    // Update conversation
    conversation.lastMessage = text;
    conversation.lastMessageAt = new Date();
    conversation.lastMessageSender = req.user._id;
    await conversation.save();

    await message.populate('sender', 'name avatar');

    // 👇 UPDATE UNREAD COUNT FOR RECIPIENT
    const recipientId = conversation.participants.find(
      p => p.toString() !== req.user._id.toString()
    );

    // Increment recipient's unread count
    await User.findByIdAndUpdate(recipientId, { 
      $inc: { unreadCount: 1 } 
    });

    // Get updated unread count for recipient
    const recipient = await User.findById(recipientId);
    const recipientUnreadCount = recipient?.unreadCount || 0;

    // Emit socket event with unread count
    const io = req.app.get('io');
    
    // Emit to recipient with new unread count
    io.to(`user-${recipientId}`).emit('new-message', {
      conversationId,
      message,
      unreadCount: recipientUnreadCount
    });

    // Emit to sender with their unread count (usually 0 for own messages)
    io.to(`user-${req.user._id}`).emit('unread-update', {
      unreadCount: 0 // Sender doesn't count own messages as unread
    });

    console.log("✅ Message sent successfully");
    res.status(201).json(message);
    
  } catch (error) {
    console.error("❌ SEND MESSAGE ERROR:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

/* MARK CONVERSATION AS READ */
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    console.log("🔍 ===== MARK AS READ CALLED =====");
    console.log("🔍 Conversation ID:", conversationId);
    console.log("🔍 User ID:", req.user._id);

    const result = await Message.updateMany(
      { 
        conversation: conversationId, 
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      },
      { $addToSet: { readBy: req.user._id } }
    );

    // Recalculate total unread count
    const userConversations = await Conversation.find({
      participants: req.user._id
    }).select('_id');
    
    const conversationIds = userConversations.map(c => c._id);
    
    const totalUnread = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: req.user._id },
      readBy: { $ne: req.user._id }
    });
    
    await User.findByIdAndUpdate(req.user._id, { unreadCount: totalUnread });

    console.log(`✅ Marked ${result.modifiedCount} messages as read`);
    res.json({ success: true });
    
  } catch (error) {
    console.error("❌ MARK AS READ ERROR:", error);
    res.status(500).json({ error: "Failed to mark as read" });
  }
};

/* 👇 NEW: Get unread count endpoint */
export const getUnreadCount = async (req, res) => {
  try {
    console.log("🔍 ===== GET UNREAD COUNT CALLED =====");
    
    const user = await User.findById(req.user._id);
    res.json({ unreadCount: user?.unreadCount || 0 });
    
  } catch (error) {
    console.error("❌ GET UNREAD COUNT ERROR:", error);
    res.status(500).json({ error: "Failed to get unread count" });
  }
};
