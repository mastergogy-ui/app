import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
{
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  ad: { type: mongoose.Schema.Types.ObjectId, ref: 'Ad' },
  lastMessage: { type: String },
  lastMessageAt: { type: Date, default: Date.now },
  lastMessageSender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
},
{ timestamps: true }
);

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

export default mongoose.model("Conversation", ConversationSchema);
