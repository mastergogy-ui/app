import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
  name: { type: String, required: true, trim: true },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    minlength: 6,
    select: false
  },

  /* GOOGLE LOGIN SUPPORT */
  googleId: {
    type: String
  },

  avatar: {
    type: String
  },

  points: { type: Number, default: 1000, min: 0 },

  isActive: { type: Boolean, default: true },

  isBanned: { type: Boolean, default: false }
},
{ timestamps: true }
);

/* HASH PASSWORD BEFORE SAVE */
userSchema.pre("save", async function saveHook(next) {
  if (!this.password) return next();
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* PASSWORD COMPARE */
userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
