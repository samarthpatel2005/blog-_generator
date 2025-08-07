const nodemailer = require('nodemailer');

// Test email configuration
const testEmailSetup = async () => {
  console.log('🧪 Testing email configuration...\n');

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'samarthbanga27@gmail.com',
        pass: process.env.EMAIL_PASS || 'your_app_password_here'
      }
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ Email configuration is valid!');
    
    // Send test email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'samarthbanga27@gmail.com',
      to: 'samarthbanga27@gmail.com',
      subject: '🚀 Test Email - Blog Subscription Setup',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; overflow: hidden;">
          <div style="padding: 30px; text-align: center;">
            <h1 style="margin: 0 0 20px 0; font-size: 28px;">🎉 Email Setup Complete!</h1>
            <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="margin: 0 0 10px 0; color: #ffd700;">Email Subscription System</h2>
              <p style="margin: 0; line-height: 1.6;">Your blog email subscription system is now working! Users can subscribe and you'll receive notifications at this email address.</p>
            </div>
            <div style="margin-top: 20px;">
              <p style="margin: 0; opacity: 0.8;">Test completed successfully! 🚀</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('📧 Test email sent successfully!');
    console.log('✅ Email subscription system is ready to use!\n');

  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    console.log('\n🔧 Setup Instructions:');
    console.log('1. Go to your Google Account settings');
    console.log('2. Enable 2-Factor Authentication');
    console.log('3. Go to Security > App passwords');
    console.log('4. Generate an app password for "Mail"');
    console.log('5. Update EMAIL_PASS in your .env file with the app password');
    console.log('6. Restart your server\n');
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  testEmailSetup();
}

module.exports = testEmailSetup;
