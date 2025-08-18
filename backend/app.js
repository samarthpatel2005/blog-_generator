const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const blogRoutes = require('./routes/blogRoutes');
const cleanupRoutes = require('./routes/cleanupRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const BlogScheduler = require('./scheduler/cronJob');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize scheduler
const scheduler = new BlogScheduler();

// Middleware
app.use(cors({
  origin: true, // Temporarily allow all origins for testing
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers for production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
}

// Request logging middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    scheduler: scheduler.getStatus()
  });
});

// Routes
app.use('/api/blogs', blogRoutes);
app.use('/api/cleanup', cleanupRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Scheduler management routes
app.get('/api/scheduler/status', (req, res) => {
  res.json(scheduler.getStatus());
});

app.post('/api/scheduler/run-weekly', async (req, res) => {
  try {
    // Run in background
    scheduler.runWeeklyGeneration().catch(console.error);
    res.json({ message: 'Weekly blog generation started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start weekly generation' });
  }
});

app.post('/api/scheduler/run-trending', async (req, res) => {
  try {
    // Run in background
    scheduler.runTrendingGeneration().catch(console.error);
    res.json({ message: 'Trending blog generation started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start trending generation' });
  }
});

app.post('/api/scheduler/run-cleanup', async (req, res) => {
  try {
    // Run in background
    scheduler.runManualCleanup().catch(console.error);
    res.json({ message: 'Blog cleanup started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start cleanup' });
  }
});

// External cron trigger endpoints (for external services like cron-job.org)
app.get('/api/cron/weekly', async (req, res) => {
  try {
    console.log('🕐 External weekly cron trigger received');
    scheduler.runWeeklyGeneration().catch(console.error);
    res.json({ success: true, message: 'Weekly blog generation triggered' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger weekly generation' });
  }
});

app.get('/api/cron/daily', async (req, res) => {
  try {
    console.log('🕐 External daily cron trigger received');
    scheduler.runTrendingGeneration().catch(console.error);
    res.json({ success: true, message: 'Daily blog generation triggered' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger daily generation' });
  }
});

app.get('/api/cron/cleanup', async (req, res) => {
  try {
    console.log('🕐 External cleanup cron trigger received');
    scheduler.runManualCleanup().catch(console.error);
    res.json({ success: true, message: 'Cleanup triggered' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger cleanup' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate entry',
      field: Object.keys(err.keyPattern)[0]
    });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Database connection
async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-blogger';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Start schedulers after database connection
    scheduler.startWeeklySchedule();
    scheduler.startDailySchedule();
    scheduler.startCleanupSchedule();
    console.log('✅ Blog schedulers started');
    console.log('🧹 Cleanup schedule started');
    
    // Keep-alive mechanism for Render (prevents sleeping)
    if (process.env.NODE_ENV === 'production') {
      setInterval(async () => {
        try {
          // Self-ping to keep the service alive
          const response = await fetch(`${process.env.RENDER_EXTERNAL_URL || 'https://blog-generator-i0l0.onrender.com'}/health`);
          console.log(`🔄 Keep-alive ping: ${response.status}`);
        } catch (error) {
          console.log('⚠️ Keep-alive ping failed:', error.message);
        }
      }, 14 * 60 * 1000); // Ping every 14 minutes
      
      console.log('✅ Keep-alive mechanism started');
    }
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start server
async function startServer() {
  try {
    await connectToDatabase();
    
    const HOST = '0.0.0.0'; // Bind to all interfaces for external access
    
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
      console.log(`📊 Health check: http://43.204.228.115:${PORT}/health`);
      console.log(`📝 API endpoint: http://43.204.228.115:${PORT}/api/blogs`);
      console.log(`📧 Subscription: http://43.204.228.115:${PORT}/api/subscription`);
      console.log(`🔄 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;