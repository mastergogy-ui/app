import mongoose from "mongoose";

const AdSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  condition: { type: String, default: "Good" },
  images: [{ type: String }],
  location: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Ad", AdSchema);
