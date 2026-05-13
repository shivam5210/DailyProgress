import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import goalRoutes from './routes/goals.js';
import checkinRoutes from './routes/checkin.js';
import engineRoutes from './routes/engine.js';
import authRoutes from './routes/auth.js';
import { verifyToken } from './middleware/auth.js';

dotenv.config();

const app = express();

// ====== MIDDLEWARE ======
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ====== PUBLIC ROUTES ======
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.post('/api/auth/sync', authRoutes);

// ====== PROTECTED ROUTES (with JWT verification) ======
app.use('/api/goals', verifyToken, goalRoutes);
app.use('/api/checkins', verifyToken, checkinRoutes);
app.use('/api/engine', verifyToken, engineRoutes);

// ====== 404 HANDLER ======
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// ====== GLOBAL ERROR HANDLER ======
app.use((err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ====== START SERVER ======
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || 'localhost';

const server = app.listen(PORT, HOST, () => {
  console.log(`
🚀 Backend server running!`);
  console.log(`📍 URL: http://${HOST}:${PORT}`);
  console.log(`🔐 CORS: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
  });
});

export default app;