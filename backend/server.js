// backend/server.js
// 1. Explicitly load dotenv at the very top of execution
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Startup environment diagnostic banner
console.log('================================================================');
console.log('🚀 [STARTUP] Initializing College Alumni Management System (ALM)');
console.log(`   Node Version: ${process.version}`);
console.log(`   Environment:  ${process.env.NODE_ENV || 'development'}`);
console.log(`   Port:         ${process.env.PORT || 5000}`);
console.log(`   Client URL:   ${process.env.CLIENT_URL || 'http://localhost:4200'}`);
console.log(`   Database URI: ${connectDB.maskMongoUri(process.env.MONGO_URI)}`);
console.log('================================================================');

// Connect to MongoDB with retry resilience
connectDB();

const app = express();

// Enable CORS for frontend client
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:4200',
  'http://127.0.0.1:4200'
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.length === 0) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'College Alumni Management System (ALM) Backend is operational',
    env: process.env.NODE_ENV || 'development',
    mongoStatus: ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'][require('mongoose').connection.readyState] || 'Unknown',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));

// 404 Handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found on this server`
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`[UnhandledRejection Error]: ${err.message}`);
});

module.exports = app;
