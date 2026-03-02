import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    predictedWinner: { type: String, enum: ['teamA', 'teamB'], required: true },
    pointsUsed: { type: Number, required: true, min: 1 },
    outcome: { type: String, enum: ['pending', 'won', 'lost'], default: 'pending' },
    pointsChange: { type: Number, default: 0 }
  },
  { timestamps: true }
);

predictionSchema.index({ user: 1, match: 1 }, { unique: true });

const Prediction = mongoose.model('Prediction', predictionSchema);
export default Prediction;
