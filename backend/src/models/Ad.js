import mongoose from "mongoose";

const AdSchema = new mongoose.Schema(
{
  title: { type: String, required: true, trim: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  priceType: { type: String, enum: ['fixed', 'negotiable'], default: 'fixed' },
  category: { 
    type: String, 
    required: true,
    enum: ['Cars', 'Properties', 'Mobiles', 'Jobs', 'Fashion', 'Bikes', 'Electronics', 'Furniture', 'Pets', 'Commercial Vehicles', 'Other']
  },
  condition: { type: String, enum: ['New', 'Like New', 'Good', 'Fair', 'For Parts'] },
  images: [{ type: String }],
  location: { type: String, required: true },
  city: { type: String, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  expiresAt: { type: Date, default: () => new Date(+new Date() + 30*24*60*60*1000) } // 30 days
},
{ timestamps: true }
);

AdSchema.index({ title: 'text', description: 'text' });
AdSchema.index({ category: 1, city: 1, createdAt: -1 });

export default mongoose.model("Ad", AdSchema);
