const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Test the subscription routes
const subscriptionRoutes = require('./routes/subscriptionRoutes');

console.log('🧪 Testing subscription routes...');

// Test if the routes file can be loaded
try {
  console.log('✅ Subscription routes loaded successfully');
  console.log('Routes type:', typeof subscriptionRoutes);
} catch (error) {
  console.error('❌ Error loading subscription routes:', error.message);
  process.exit(1);
}

// Test the nodemailer setup
try {
  const nodemailer = require('nodemailer');
  console.log('✅ Nodemailer loaded successfully');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  console.log('✅ Email transporter created successfully');
} catch (error) {
  console.error('❌ Error with nodemailer:', error.message);
}

console.log('\n📋 Environment Variables:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***set***' : 'NOT SET');
console.log('PORT:', process.env.PORT);

console.log('\n🚀 Starting minimal server test...');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Add subscription routes
app.use('/api/subscription', subscriptionRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`📧 Subscription endpoint: http://localhost:${PORT}/api/subscription/subscribe`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
});

// Test the subscription endpoint after a short delay
setTimeout(async () => {
  try {
    const fetch = require('node-fetch');
    const response = await fetch(`http://localhost:${PORT}/test`);
    const data = await response.text();
    console.log('🧪 Test endpoint response:', data);
  } catch (error) {
    console.error('❌ Test endpoint error:', error.message);
  }
}, 2000);
