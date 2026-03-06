import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import hpp from 'hpp';
import xssClean from 'xss-clean';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xssClean());
app.use(hpp());
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(',') || ['http://localhost:3000'],
    credentials: true
  })
);
app.use((req, _, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/auth', authLimiter);

app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
    app: 'GoGo Fantasy Points',
    disclaimer: 'This platform uses virtual points only. No real money involved.'
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use("/", adRoutes);

app.use((_, res) => res.status(404).json({ message: 'Route not found' }));
app.use((error, _, res, __) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || 'Server error' });
});

export default app;
