require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import configuration and models
const { testConnection } = require('./config/db');
const { syncDatabase } = require('./models');
const { errorHandler, notFound } = require('./middleware/validation');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const companyRoutes = require('./routes/companies');
const expenseRoutes = require('./routes/expenses');
const workflowRoutes = require('./routes/workflows');
const testRoutes = require('./routes/test');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    timestamp: new Date().toISOString()
  }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/workflows', workflowRoutes);
app.use('/api/v1/test', testRoutes);

// API info route (moved after specific routes)
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Expense Management API v1.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      companies: '/api/v1/companies',
      expenses: '/api/v1/expenses',
      workflows: '/api/v1/workflows'
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database (create tables)
    await syncDatabase(false); // Set to true to drop and recreate tables
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();

module.exports = app;