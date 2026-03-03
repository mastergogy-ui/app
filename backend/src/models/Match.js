import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    teamA: { type: String, required: true, trim: true },
    teamB: { type: String, required: true, trim: true },
    startsAt: { type: Date, required: true },
    predictionClosed: { type: Boolean, default: false },
    status: { type: String, enum: ['upcoming', 'closed', 'completed'], default: 'upcoming' },
    winner: { type: String, enum: ['teamA', 'teamB', null], default: null }
  },
  { timestamps: true }
);

const Match = mongoose.model('Match', matchSchema);
export default Match;
