const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS  // Your app password
  }
});

// Store for subscriber emails (in production, use a database)
const subscribers = new Set();

// Subscribe endpoint
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid email address' 
      });
    }

    // Check if already subscribed
    if (subscribers.has(email.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already subscribed' 
      });
    }

    // Add to subscribers
    subscribers.add(email.toLowerCase());

    // Send notification email to you
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'samarthbanga27@gmail.com',
      subject: '🚀 New Blog Subscription!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; overflow: hidden;">
          <div style="padding: 30px; text-align: center;">
            <h1 style="margin: 0 0 20px 0; font-size: 28px;">🎉 New Subscriber!</h1>
            <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="margin: 0 0 10px 0; color: #ffd700;">Email Address:</h2>
              <p style="font-size: 18px; font-weight: bold; margin: 0; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 5px;">${email}</p>
            </div>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.3);">
              <p style="margin: 0; opacity: 0.8;">Subscribed to your AI Blog updates</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.6;">Total subscribers: ${subscribers.size}</p>
            </div>
          </div>
        </div>
      `
    };

    // Send confirmation email to subscriber
    const confirmationMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🎯 Welcome to AI Blog Updates!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border-radius: 10px; overflow: hidden;">
          <div style="padding: 30px; text-align: center;">
            <h1 style="margin: 0 0 20px 0; font-size: 28px;">🚀 Welcome to AI Blog!</h1>
            <div style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="margin: 0 0 15px 0; color: #ffeb3b;">Thank you for subscribing!</h2>
              <p style="margin: 0; line-height: 1.6;">You'll now receive the latest AI-generated blog posts, tech insights, and innovative content directly in your inbox.</p>
            </div>
            <div style="margin-top: 20px;">
              <p style="margin: 0; opacity: 0.9;">Stay curious, stay updated! 🧠✨</p>
            </div>
          </div>
        </div>
      `
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(mailOptions),
      transporter.sendMail(confirmationMailOptions)
    ]);

    res.json({ 
      success: true, 
      message: 'Successfully subscribed! Check your email for confirmation.' 
    });

  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process subscription. Please try again.' 
    });
  }
});

// Get subscribers count (optional)
router.get('/count', (req, res) => {
  res.json({ count: subscribers.size });
});

module.exports = router;
