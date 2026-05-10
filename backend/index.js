import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import goalRoutes from './routes/goals.js';
import checkinRoutes from './routes/checkin.js';
import engineRoutes from './routes/engine.js';
import { verifyToken } from './middleware/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/goals', verifyToken, goalRoutes);
app.use('/api/checkins', verifyToken, checkinRoutes);
app.use('/api/engine', verifyToken, engineRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
