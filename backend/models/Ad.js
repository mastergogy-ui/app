import mongoose from "mongoose";

const adSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    category: String,
    subcategory: String,
    images: [String],
    location: {
      city: String,
      state: String,
      pincode: String,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model("Ad", adSchema);
