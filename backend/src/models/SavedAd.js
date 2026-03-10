import mongoose from "mongoose";

const SavedAdSchema = new mongoose.Schema(
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ad: { type: mongoose.Schema.Types.ObjectId, ref: 'Ad', required: true }
},
{ timestamps: true }
);

SavedAdSchema.index({ user: 1, ad: 1 }, { unique: true });

export default mongoose.model("SavedAd", SavedAdSchema);
