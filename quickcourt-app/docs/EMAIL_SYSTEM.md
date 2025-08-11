# QuickCourt Email System Documentation

## Overview

The QuickCourt email system provides automated email notifications for booking confirmations, cancellations, and reminders. It uses Nodemailer for email delivery and Handlebars for template compilation.

## Features

### 📧 Email Types

1. **Booking Confirmation**
   - Sent immediately after successful booking
   - Includes booking details, venue information, and payment confirmation
   - Professional HTML template with responsive design

2. **Booking Cancellation**
   - Sent when a booking is cancelled
   - Includes refund information and cancellation details
   - Provides links to book again

3. **Booking Reminders**
   - 24-hour reminder: Sent 1 day before booking
   - 2-hour reminder: Sent 2 hours before booking
   - 30-minute reminder: Sent 30 minutes before booking
   - Includes venue contact info and preparation tips

4. **Welcome Email**
   - Sent to new users after registration
   - Role-specific content for users and facility owners

### 🎨 Email Templates

All emails feature:
- Responsive HTML design
- QuickCourt branding
- Professional styling with gradients and cards
- Mobile-friendly layout
- Unsubscribe links
- Contact information

### ⚙️ Configuration

#### Environment Variables

\`\`\`env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@quickcourt.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

#### Gmail Setup

1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

#### Other SMTP Providers

- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`
- **AWS SES**: `email-smtp.region.amazonaws.com:587`

### 🔧 API Endpoints

#### Booking Confirmation
\`\`\`
POST /api/bookings/confirm
\`\`\`

#### Booking Cancellation
\`\`\`
POST /api/bookings/cancel
\`\`\`

#### Booking Reminder
\`\`\`
POST /api/bookings/reminder
\`\`\`

### 📅 Email Scheduling

The system includes an email scheduler that automatically sends reminder emails:

\`\`\`typescript
import { emailScheduler } from '@/lib/email-scheduler'

// Schedule reminders for a booking
emailScheduler.scheduleBookingReminders(booking)

// Cancel reminders (when booking is cancelled)
emailScheduler.cancelBookingReminders(bookingId)
\`\`\`

### 🧪 Testing

#### Development Mode
In development, emails are logged to console instead of being sent.

#### Email Test Panel
Access the test panel at the bottom of the home page (development only):
- Test different email types
- Send to custom email addresses
- Verify email content and delivery

#### Manual Testing
\`\`\`bash
# Send test confirmation email
curl -X POST http://localhost:3000/api/bookings/confirm \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test User","customerEmail":"test@example.com",...}'
\`\`\`

### 📊 Monitoring

#### Email Delivery Status
- Success/failure logging
- Email delivery tracking
- Error handling and retry logic

#### Scheduled Reminders
\`\`\`typescript
// Check scheduled reminders count
const count = emailScheduler.getScheduledRemindersCount()
console.log(`Active reminders: ${count}`)
\`\`\`

### 🚀 Production Deployment

1. **Configure SMTP Provider**
   - Use a reliable service (SendGrid, Mailgun, AWS SES)
   - Set up proper authentication
   - Configure SPF/DKIM records

2. **Environment Variables**
   - Set production SMTP credentials
   - Update `NEXT_PUBLIC_APP_URL`
   - Set `NODE_ENV=production`

3. **Email Deliverability**
   - Use a dedicated sending domain
   - Implement proper email authentication
   - Monitor bounce rates and spam complaints

### 🔒 Security

- SMTP credentials stored in environment variables
- No sensitive data in email templates
- Unsubscribe links for compliance
- Rate limiting on email endpoints

### 📈 Analytics

Track email performance:
- Open rates
- Click-through rates
- Bounce rates
- Unsubscribe rates

### 🛠️ Customization

#### Custom Templates
Modify templates in `/lib/email.ts`:
\`\`\`typescript
const customTemplate = `
   Your custom HTML template 
`
\`\`\`

#### Additional Email Types
Add new email types by:
1. Creating template in `email.ts`
2. Adding method to `EmailService`
3. Creating API endpoint
4. Integrating with booking flow

### 🐛 Troubleshooting

#### Common Issues

1. **Emails not sending**
   - Check SMTP credentials
   - Verify network connectivity
   - Check spam folder

2. **Template rendering issues**
   - Validate Handlebars syntax
   - Check data structure
   - Test with sample data

3. **Scheduling problems**
   - Verify date/time calculations
   - Check timezone handling
   - Monitor scheduled jobs

#### Debug Mode
Enable detailed logging:
\`\`\`typescript
console.log('Email debug info:', {
  to: emailData.customerEmail,
  subject: subject,
  templateData: emailData
})
\`\`\`

### 📝 Best Practices

1. **Email Content**
   - Keep subject lines clear and concise
   - Include all relevant booking information
   - Provide clear call-to-action buttons
   - Add contact information

2. **Delivery**
   - Send confirmations immediately
   - Schedule reminders appropriately
   - Handle failures gracefully
   - Implement retry logic

3. **Compliance**
   - Include unsubscribe links
   - Respect user preferences
   - Follow CAN-SPAM guidelines
   - Maintain email lists properly

### 🔄 Future Enhancements

- Email templates editor in admin panel
- A/B testing for email content
- Advanced scheduling options
- Email analytics dashboard
- Multi-language support
- SMS notifications integration
