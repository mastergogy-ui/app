import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Ad from "../models/Ad.js";

/* GET USER CONVERSATIONS */
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    })
    .populate('participants', 'name avatar')
    .populate('ad', 'title images price')
    .populate('lastMessageSender', 'name')
    .sort({ lastMessageAt: -1 });

    res.json(conversations);
    
  } catch (error) {
    console.log("GET CONVERSATIONS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

/* GET SINGLE CONVERSATION WITH MESSAGES */
export const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'name avatar')
      .populate('ad', 'title images price user');

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { 
        conversation: req.params.id, 
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({ conversation, messages });
    
  } catch (error) {
    console.log("GET CONVERSATION ERROR:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};

/* START NEW CONVERSATION */
export const startConversation = async (req, res) => {
  try {
    const { adId, message } = req.body;
    
    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    // Don't let user message themselves
    if (ad.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot message yourself" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, ad.user] },
      ad: adId
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, ad.user],
        ad: adId,
        lastMessage: message,
        lastMessageSender: req.user._id
      });
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

    res.status(201).json({ conversation, message: newMessage });
    
  } catch (error) {
    console.log("START CONVERSATION ERROR:", error);
    res.status(500).json({ error: "Failed to start conversation" });
  }
};

/* SEND MESSAGE */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user._id)) {
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

    // Emit socket event
    const io = req.app.get('io');
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user._id.toString()) {
        io.to(`user-${participantId}`).emit('new-message', {
          conversationId,
          message
        });
      }
    });

    res.status(201).json(message);
    
  } catch (error) {
    console.log("SEND MESSAGE ERROR:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

/* MARK CONVERSATION AS READ */
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.updateMany(
      { 
        conversation: conversationId, 
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({ success: true });
    
  } catch (error) {
    console.log("MARK AS READ ERROR:", error);
    res.status(500).json({ error: "Failed to mark as read" });
  }
};
