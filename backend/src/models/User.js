import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
      validate: {
        validator: (v) => !v || /\S+@\S+\.\S+/.test(v),
        message: 'Invalid email'
      }
    },
    phone: { type: String, trim: true, sparse: true, unique: true },
    password: { type: String, minlength: 6, select: false },
    googleId: { type: String, unique: true, sparse: true },
    profileImage: String
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

userSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) return next(new Error('Either email or phone is required'));
  next();
});

export const User = mongoose.model('User', userSchema);
