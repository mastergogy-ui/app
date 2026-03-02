import mongoose from 'mongoose';

const adSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 60 },
    description: {
      type: String,
      required: true,
      validate: {
        validator: (v) => v.trim().split(/\s+/).length <= 100,
        message: 'Description cannot exceed 100 words'
      }
    },
    category: {
      type: String,
      required: true,
      enum: ['Rent a Friend', 'Rent a Bike', 'Rent a Car', 'Rent a Property']
    },
    price: { type: Number, required: true, min: 0 },
    images: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'Maximum 5 images'
      }
    },
    location: {
      city: String,
      state: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

adSchema.index({ title: 'text', description: 'text' });
adSchema.index({ category: 1 });
adSchema.index({ 'location.city': 1, 'location.state': 1, 'location.country': 1 });

export const Ad = mongoose.model('Ad', adSchema);
