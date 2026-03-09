import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import Admin from '../models/Admin.js';
import Match from '../models/Match.js';
import User from '../models/User.js';

dotenv.config();

const run = async () => {
  await connectDB();

  await Promise.all([Admin.deleteMany({}), User.deleteMany({}), Match.deleteMany({})]);

  await Admin.create({ username: 'superadmin', password: 'Admin@123' });

  await User.create([
    { name: 'Alex', email: 'alex@gogo.com', password: 'Pass@123', points: 1200 },
    { name: 'Jordan', email: 'jordan@gogo.com', password: 'Pass@123', points: 900 }
  ]);

  const now = Date.now();
  await Match.create([
    { teamA: 'Lions', teamB: 'Tigers', startsAt: new Date(now + 24 * 60 * 60 * 1000) },
    { teamA: 'Wolves', teamB: 'Hawks', startsAt: new Date(now + 48 * 60 * 60 * 1000) }
  ]);

  console.log('Seed complete');
  process.exit(0);
};

run();
