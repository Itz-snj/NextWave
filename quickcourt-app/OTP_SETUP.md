# OTP Verification System Setup Guide

This guide will help you set up the OTP verification system for QuickCourt with Gmail SMTP.

## 🚀 Quick Start

1. **Copy environment variables:**
   ```bash
   cp env.example .env.local
   ```

2. **Fill in your Gmail credentials in `.env.local`**

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📧 Gmail SMTP Configuration

### Step 1: Enable 2-Step Verification
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Step Verification if not already enabled

### Step 2: Generate App Password
1. In **Security** → **2-Step Verification**, click on **App passwords**
2. Select **Mail** as the app and **Other** as the device
3. Click **Generate**
4. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update Environment Variables
In your `.env.local` file:
```env
GMAIL_USER=your-actual-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
```

## 🔧 Database Setup

### MongoDB Connection
1. Ensure MongoDB is running locally or use MongoDB Atlas
2. Update `MONGO_URL` in `.env.local`:
   ```env
   # Local MongoDB
   MONGO_URL=mongodb://localhost:27017/quickcourt
   
   # MongoDB Atlas
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/quickcourt
   ```

### Database Schema
The OTP system automatically creates the necessary collections:
- `users` - User accounts
- `otps` - OTP records with expiry and usage tracking

## 🧪 Testing the OTP System

### 1. Test Email Sending
1. Navigate to `/auth/login`
2. Enter your email address
3. Click "Send OTP" button
4. Check your email inbox for the OTP
5. In development mode, OTP is also logged to console

### 2. Test OTP Verification
1. Enter the 6-digit OTP from your email
2. Click "Verify OTP" button
3. If successful, you'll see "OTP Verified!" message
4. Enter your password to complete login

### 3. Test Error Handling
- Try invalid OTPs
- Wait for OTP expiry (5 minutes)
- Test rate limiting (1 minute between OTP requests)

## 🔒 Security Features

### OTP Security
- **6-digit random OTP** generated for each request
- **5-minute expiry** with automatic cleanup
- **3 verification attempts** maximum per OTP
- **Rate limiting** - 1 minute between OTP requests
- **Hashed storage** using bcrypt

### Email Security
- **Gmail App Password** (not regular password)
- **SMTP over TLS** (port 587)
- **Professional email templates** with security warnings

## 🐛 Troubleshooting

### Common Issues

#### 1. "Authentication failed" error
- Verify Gmail credentials in `.env.local`
- Ensure 2-Step Verification is enabled
- Check App Password is correct

#### 2. "OTP not received"
- Check spam/junk folder
- Verify email address is correct
- Check console logs for errors

#### 3. "Database connection failed"
- Ensure MongoDB is running
- Check `MONGO_URL` in `.env.local`
- Verify network connectivity

#### 4. "Rate limit exceeded"
- Wait 1 minute between OTP requests
- Check if previous OTP is still valid

### Debug Mode
In development, OTPs are logged to console:
```bash
🔐 OTP for user@example.com: 123456
```

## 📱 Frontend Features

### User Experience
- **Progressive disclosure** - Fields appear as needed
- **Real-time validation** - Immediate feedback
- **Loading states** - Clear indication of processing
- **Error handling** - User-friendly error messages
- **Responsive design** - Works on all devices

### UI Components
- Email input with send OTP button
- OTP input with verification button
- Password input (appears after OTP verification)
- Progress indicators and status messages
- Reset functionality to start over

## 🚀 Production Deployment

### Environment Variables
```env
NODE_ENV=production
GMAIL_USER=your-production-gmail@gmail.com
GMAIL_APP_PASSWORD=your-production-app-password
MONGO_URL=your-production-mongodb-url
```

### Security Considerations
- Use environment-specific Gmail accounts
- Monitor email sending limits
- Implement IP whitelisting if needed
- Set up email delivery monitoring

## 📊 Monitoring & Analytics

### Email Delivery
- Check Gmail Sent folder for delivery confirmation
- Monitor SMTP server logs
- Track OTP success/failure rates

### Database Monitoring
- Monitor OTP collection size
- Track verification success rates
- Monitor expiry cleanup performance

## 🔄 API Endpoints

### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

## 📝 Customization

### Email Templates
- Modify templates in `lib/email.ts`
- Update styling and branding
- Add multi-language support

### OTP Configuration
- Change OTP length in `generateOTP()` function
- Adjust expiry time (currently 5 minutes)
- Modify rate limiting (currently 1 minute)

### UI Styling
- Update colors and themes in `app/auth/login/page.tsx`
- Modify component layouts
- Add animations and transitions

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check browser console and server logs
4. Ensure all dependencies are installed
5. Verify MongoDB connection and permissions

## 📚 Additional Resources

- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [MongoDB Connection Strings](https://docs.mongodb.com/manual/reference/connection-string/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Nodemailer Documentation](https://nodemailer.com/)
