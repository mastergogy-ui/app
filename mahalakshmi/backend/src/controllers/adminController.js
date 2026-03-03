import Match from '../models/Match.js';
import Prediction from '../models/Prediction.js';
import User from '../models/User.js';

export const createMatch = async (req, res) => {
  const { teamA, teamB, startsAt } = req.body;
  if (!teamA || !teamB || !startsAt) return res.status(400).json({ message: 'teamA, teamB, startsAt required' });
  const match = await Match.create({ teamA, teamB, startsAt });
  res.status(201).json(match);
};

export const listMatches = async (_, res) => {
  const matches = await Match.find().sort({ startsAt: -1 });
  res.json(matches);
};

export const closePrediction = async (req, res) => {
  const match = await Match.findById(req.params.matchId);
  if (!match) return res.status(404).json({ message: 'Match not found' });
  match.predictionClosed = true;
  match.status = 'closed';
  await match.save();
  res.json(match);
};

export const declareWinner = async (req, res) => {
  const { winner } = req.body;
  const match = await Match.findById(req.params.matchId);
  if (!match) return res.status(404).json({ message: 'Match not found' });
  if (!['teamA', 'teamB'].includes(winner)) return res.status(400).json({ message: 'Invalid winner' });

  match.winner = winner;
  match.predictionClosed = true;
  match.status = 'completed';
  await match.save();

  const predictions = await Prediction.find({ match: match._id, outcome: 'pending' });
  for (const prediction of predictions) {
    const user = await User.findById(prediction.user);
    if (!user) continue;

    if (prediction.predictedWinner === winner) {
      const winnings = prediction.pointsUsed * 2;
      user.points += winnings;
      prediction.outcome = 'won';
      prediction.pointsChange = winnings;
    } else {
      prediction.outcome = 'lost';
      prediction.pointsChange = -prediction.pointsUsed;
    }

    await user.save();
    await prediction.save();
  }

  res.json({ message: 'Winner declared and predictions settled' });
};

export const adjustUserPoints = async (req, res) => {
  const { pointsDelta } = req.body;
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.points = Math.max(0, user.points + Number(pointsDelta || 0));
  await user.save();
  res.json({ userId: user._id, points: user.points });
};

export const setUserStatus = async (req, res) => {
  const { isActive, isBanned } = req.body;
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (typeof isActive === 'boolean') user.isActive = isActive;
  if (typeof isBanned === 'boolean') user.isBanned = isBanned;
  await user.save();

  res.json({ userId: user._id, isActive: user.isActive, isBanned: user.isBanned });
};

export const getAnalytics = async (_, res) => {
  const [totalUsers, activePredictions, completedMatches] = await Promise.all([
    User.countDocuments(),
    Prediction.countDocuments({ outcome: 'pending' }),
    Match.countDocuments({ status: 'completed' })
  ]);

  res.json({ totalUsers, activePredictions, completedMatches });
};
