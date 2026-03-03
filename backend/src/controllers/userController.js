import Match from '../models/Match.js';
import Prediction from '../models/Prediction.js';
import User from '../models/User.js';

export const getDashboard = async (req, res) => {
  const upcomingMatches = await Match.find({ status: { $in: ['upcoming', 'closed'] } }).sort({ startsAt: 1 }).limit(10);
  const activePredictions = await Prediction.find({ user: req.user._id, outcome: 'pending' }).populate('match');
  res.json({
    user: { id: req.user._id, name: req.user.name, points: req.user.points, email: req.user.email },
    upcomingMatches,
    activePredictions,
    disclaimer: 'This platform uses virtual points only. No real money involved.'
  });
};

export const createPrediction = async (req, res) => {
  const { matchId, predictedWinner, pointsUsed } = req.body;
  const numericPoints = Number(pointsUsed);

  const match = await Match.findById(matchId);
  if (!match) return res.status(404).json({ message: 'Match not found' });
  if (match.predictionClosed || new Date(match.startsAt) <= new Date()) {
    return res.status(400).json({ message: 'Predictions are closed for this match' });
  }

  if (!['teamA', 'teamB'].includes(predictedWinner)) {
    return res.status(400).json({ message: 'Invalid predicted winner' });
  }
  if (!numericPoints || numericPoints < 1 || numericPoints > req.user.points) {
    return res.status(400).json({ message: 'Invalid points amount' });
  }

  const existing = await Prediction.findOne({ user: req.user._id, match: matchId });
  if (existing) return res.status(409).json({ message: 'Prediction already placed for this match' });

  req.user.points -= numericPoints;
  await req.user.save();

  const prediction = await Prediction.create({
    user: req.user._id,
    match: matchId,
    predictedWinner,
    pointsUsed: numericPoints
  });

  res.status(201).json({ prediction, pointsBalance: req.user.points });
};

export const getMatchHistory = async (req, res) => {
  const history = await Prediction.find({ user: req.user._id }).populate('match').sort({ createdAt: -1 });
  res.json(history);
};

export const getLeaderboard = async (_, res) => {
  const leaders = await User.find({ isActive: true, isBanned: false }).sort({ points: -1 }).limit(20).select('name points');
  res.json(leaders);
};

export const getProfile = async (req, res) => {
  const profile = await User.findById(req.user._id).select('name email points isActive isBanned createdAt');
  res.json(profile);
};
