require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// ── Import Route Modules ────────────────────────────────────────────────────
const serviceRoutes = require('./routes/serviceRoutes');
const userRoutes = require('./routes/userRoutes');
const communityRoutes = require('./routes/communityRoutes');

// ── Initialize Express Application ─────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB ──────────────────────────────────────────────────────
connectDB();

// ── Global Middleware ───────────────────────────────────────────────────────

// CORS: Allow requests from the React dev server and production origin
app.use(
  cors({
    origin: [
      'http://localhost:5173', // Vite default dev port
      'http://localhost:3000', // CRA / alternative dev port
      process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// JSON Body Parser: Parse incoming requests with JSON payloads up to 10MB
app.use(express.json({ limit: '10mb' }));

// URL-encoded Body Parser: Support form-encoded data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`📥  ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/community', communityRoutes);

// ── Health Check Endpoint ───────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'LocGovt API is running.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── Root Endpoint ───────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to LocGovt API 🇮🇳',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// ── 404 Handler: Catch all unmatched routes ─────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ── Global Error Handler ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('💥  Unhandled Error:', err.stack || err.message);

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error.',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

const { startHealthChecker } = require('./utils/healthChecker');

// ── Start HTTP Server ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  LocGovt Server running on http://localhost:${PORT}`);
  console.log(`📊  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️   MongoDB URI: ${process.env.MONGO_URI || 'mongodb://localhost:27017/locgovt'}`);
  console.log('─'.repeat(60));

  // Initialize automatic background URL status monitor
  startHealthChecker();
});

module.exports = app;
