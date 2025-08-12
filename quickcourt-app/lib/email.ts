import nodemailer from 'nodemailer';
import handlebars from 'handlebars';

// Gmail SMTP Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (NOT regular password)
  },
});

// Verify transporter connection
transporter.verify(function (error, success) {
  if (error) {
    console.log('SMTP Server Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

// OTP Email Template
const otpEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuickCourt - OTP Verification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>QuickCourt</h1>
            <p>OTP Verification</p>
        </div>
        <div class="content">
            <h2>Hello!</h2>
            <p>You have requested to verify your email address for QuickCourt. Please use the following OTP to complete your verification:</p>
            
            <div class="otp-box">
                <div class="otp-code">{{otp}}</div>
            </div>
            
            <div class="warning">
                <strong>Important:</strong>
                <ul>
                    <li>This OTP will expire in 5 minutes</li>
                    <li>Do not share this OTP with anyone</li>
                    <li>If you didn't request this, please ignore this email</li>
                </ul>
            </div>
            
            <p>Best regards,<br>The QuickCourt Team</p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
`;

// Compile the template
const compiledTemplate = handlebars.compile(otpEmailTemplate);

// Send OTP Email
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    const htmlContent = compiledTemplate({ otp });
    
    const mailOptions = {
      from: `"QuickCourt" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'QuickCourt - OTP Verification Code',
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}

// Send Welcome Email (after successful verification)
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  try {
    const welcomeTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Welcome to QuickCourt</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Welcome to QuickCourt!</h1>
              </div>
              <div class="content">
                  <h2>Hello ${name}!</h2>
                  <p>Your email has been successfully verified. Welcome to QuickCourt - your premier sports facility booking platform!</p>
                  <p>You can now:</p>
                  <ul>
                      <li>Browse and book sports facilities</li>
                      <li>Manage your bookings</li>
                      <li>Explore different venues and courts</li>
                      <li>Enjoy seamless sports facility management</li>
                  </ul>
                  <p>Get started by visiting our platform!</p>
                  <p>Best regards,<br>The QuickCourt Team</p>
              </div>
          </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"QuickCourt" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Welcome to QuickCourt - Email Verified!',
      html: welcomeTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

export default transporter;
