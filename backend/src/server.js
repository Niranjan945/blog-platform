const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');

const app = express();

// Basic CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Blog Platform API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Blog Platform API',
    status: 'online'
  });
});

// 404 Handler
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error Handler
app.use((error, req, res, next) => {
  console.error('Error:', error.message);
  res.status(error.statusCode || 500).json({
    status: 'error',
    message: error.message || 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;

// Start server after database connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Blog Server running on port ${PORT}`);
    console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Add this at the bottom of your server.js file
const keepServerAwake = () => {
  const serverUrl = 'https://blog-platform-k0qz.onrender.com';
  
  setInterval(async () => {
    try {
      const response = await fetch(`${serverUrl}/health`);
      console.log(`Keep-alive ping: ${response.status}`);
    } catch (error) {
      console.log('Keep-alive ping failed:', error.message);
    }
  }, 14 * 60 * 1000); // Ping every 14 minutes
};

// Start keep-alive only in production
if (process.env.NODE_ENV === 'production') {
  keepServerAwake();
  console.log('🔄 Keep-alive service started');
}
