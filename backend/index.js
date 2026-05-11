import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import goalRoutes from './routes/goals.js';
import checkinRoutes from './routes/checkin.js';
import engineRoutes from './routes/engine.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Public routes - all routes are now public
app.use('/api/goals', goalRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/engine', engineRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});