# QuickCourt Booking System - Complete Guide

## 🎯 Overview

The QuickCourt booking system allows users to book sports courts at various venues. When a user clicks "Book & Pay", the system:

1. **Validates** the booking data
2. **Checks** availability of the selected time slot
3. **Creates** a booking record in the database
4. **Updates** the time slot availability
5. **Sends** a confirmation email
6. **Redirects** the user to their bookings page

## 🏗️ System Architecture

### Database Models

#### Booking Schema
```typescript
{
  user: ObjectId,           // Reference to User
  venue: ObjectId,          // Reference to Venue
  court: ObjectId,          // Reference to Court
  date: String,             // YYYY-MM-DD format
  time: String,             // HH:mm format
  duration: Number,         // Hours
  totalAmount: Number,      // Total price
  status: String,           // 'confirmed' | 'cancelled'
  customerName: String,     // Customer details
  customerEmail: String,
  venueName: String,
  venueLocation: String,
  courtName: String,
  sport: String,
  paymentStatus: String,    // 'pending' | 'completed' | 'failed'
  paymentMethod: String,    // 'online'
  notes: String,
  timestamps: true
}
```

#### TimeSlot Schema
```typescript
{
  venue: ObjectId,          // Reference to Venue
  court: ObjectId,          // Reference to Court
  date: String,             // YYYY-MM-DD format
  time: String,             // HH:mm format
  price: Number,            // Price per hour
  isAvailable: Boolean,     // Availability status
  timestamps: true
}
```

### API Endpoints

#### Booking Confirmation
- **POST** `/api/bookings/confirm`
- **Purpose**: Create a new booking
- **Request Body**:
  ```json
  {
    "userId": "user_id",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "venueId": "venue_id",
    "venueName": "Sports Arena",
    "venueLocation": "City, State",
    "courtId": "court_id",
    "courtName": "Court 1",
    "sport": "Tennis",
    "date": "2024-01-15",
    "time": "18:00",
    "duration": 2,
    "totalAmount": 2000
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "booking": { /* booking object */ },
    "emailSent": true,
    "message": "Booking confirmed successfully",
    "bookingId": "booking_id"
  }
  ```

#### Time Slots
- **GET** `/api/timeslots?venue=venue_id&court=court_id&date=2024-01-15&cleanup=1`
- **Purpose**: Get available time slots for a court on a specific date
- **Response**: Array of time slot objects

#### User Bookings
- **GET** `/api/bookings?user=user_id`
- **Purpose**: Get all bookings for a user
- **Response**: Array of booking objects with populated venue and court data

## 🚀 How to Test the Booking System

### Prerequisites

1. **MongoDB Setup**
   ```bash
   # Install MongoDB locally or use MongoDB Atlas
   # Set MONGO_URL environment variable
   export MONGO_URL=mongodb://localhost:27017/quickcourt
   ```

2. **Environment Variables**
   Create `.env.local` file:
   ```env
   MONGO_URL=mongodb://localhost:27017/quickcourt
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_FROM=noreply@quickcourt.com
   ```

### Step-by-Step Testing

1. **Setup Test Data**
   ```bash
   cd quickcourt-app
   node scripts/test-booking-flow.js
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Test Database Connection**
   ```bash
   curl http://localhost:3000/api/test-db
   ```

4. **Test Data Availability**
   ```bash
   curl http://localhost:3000/api/test-data
   ```

5. **Complete Booking Flow**
   - Go to `http://localhost:3000/auth/login`
   - Login with: `test@example.com` / `password123`
   - Go to `http://localhost:3000/venues`
   - Click on "Test Sports Arena"
   - Select a court
   - Choose tomorrow's date
   - Select a time slot
   - Choose duration
   - Click "Book & Pay"

### Expected Results

1. **Booking Creation**: Booking should be created in database
2. **Time Slot Update**: Selected time slot should be marked as unavailable
3. **Email Confirmation**: Confirmation email should be sent (logged in development)
4. **Success Message**: User should see success toast with booking ID
5. **Redirect**: User should be redirected to `/bookings` page
6. **Booking List**: New booking should appear in user's booking list

## 🔧 Troubleshooting

### Common Issues

#### 1. "Missing required fields" Error
**Cause**: Incomplete booking data
**Solution**: Check that all required fields are being sent:
- `userId` - User must be logged in
- `venueId` - Valid venue ID
- `courtId` - Valid court ID
- `date` - Valid date format (YYYY-MM-DD)
- `time` - Valid time format (HH:mm)
- `totalAmount` - Calculated price

#### 2. "Timeslot not available" Error
**Cause**: Time slot already booked or doesn't exist
**Solution**: 
- Check if time slot exists in database
- Verify time slot is marked as available
- Refresh available slots on the frontend

#### 3. "Database connection failed" Error
**Cause**: MongoDB connection issues
**Solution**:
- Check `MONGO_URL` environment variable
- Ensure MongoDB is running
- Test connection: `http://localhost:3000/api/test-db`

#### 4. "User not found" Error
**Cause**: Invalid user ID or user not logged in
**Solution**:
- Ensure user is properly authenticated
- Check user ID format
- Verify user exists in database

#### 5. "Venue/Court not found" Error
**Cause**: Invalid venue or court ID
**Solution**:
- Run test data setup script
- Check venue and court IDs in URL
- Verify data exists in database

### Debug Steps

1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for JavaScript errors
   - Check network requests

2. **Check Server Logs**
   - Monitor terminal where `npm run dev` is running
   - Look for API request logs
   - Check for error messages

3. **Test API Endpoints**
   ```bash
   # Test database connection
   curl http://localhost:3000/api/test-db
   
   # Test data availability
   curl http://localhost:3000/api/test-data
   
   # Test timeslots
   curl "http://localhost:3000/api/timeslots?venue=venue_id&court=court_id&date=2024-01-15"
   ```

4. **Check Database**
   ```bash
   # Connect to MongoDB
   mongosh mongodb://localhost:27017/quickcourt
   
   # Check collections
   show collections
   
   # Check bookings
   db.bookings.find().pretty()
   
   # Check timeslots
   db.timeslots.find().pretty()
   ```

## 📧 Email System

### Email Templates

The system sends confirmation emails using Handlebars templates:

- **Booking Confirmation**: Sent immediately after successful booking
- **Booking Cancellation**: Sent when booking is cancelled
- **Booking Reminders**: Sent 24h, 2h, and 30m before booking

### Email Configuration

In development, emails are logged to console instead of being sent:
```
📧 EMAIL WOULD BE SENT:
To: user@example.com
Subject: 🎾 Booking Confirmed - Venue Name | QuickCourt
HTML Preview: <!DOCTYPE html>...
```

### Production Email Setup

1. **Configure SMTP Provider**
   - Gmail, SendGrid, Mailgun, or AWS SES
   - Set up proper authentication
   - Configure SPF/DKIM records

2. **Environment Variables**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_FROM=noreply@quickcourt.com
   ```

## 🔒 Security Considerations

1. **Authentication**: Users must be logged in to make bookings
2. **Validation**: All booking data is validated server-side
3. **Availability Check**: Time slots are checked for availability before booking
4. **Database Transactions**: Consider implementing transactions for booking creation
5. **Rate Limiting**: Consider implementing rate limiting for booking API
6. **Input Sanitization**: All user inputs are sanitized and validated

## 🚀 Production Deployment

1. **Database**: Use MongoDB Atlas or self-hosted MongoDB
2. **Email**: Use reliable SMTP provider (SendGrid, Mailgun, AWS SES)
3. **Environment**: Set `NODE_ENV=production`
4. **Monitoring**: Implement logging and monitoring
5. **Backup**: Set up database backups
6. **SSL**: Use HTTPS in production

## 📊 Monitoring and Analytics

### Key Metrics to Track

1. **Booking Success Rate**: Percentage of successful bookings
2. **Booking Volume**: Number of bookings per day/week/month
3. **Popular Time Slots**: Most booked time slots
4. **Revenue**: Total booking revenue
5. **User Engagement**: Booking frequency per user
6. **Error Rates**: Failed booking attempts

### Logging

The system includes comprehensive logging:
- Booking creation attempts
- Success/failure rates
- Error details
- Email delivery status
- Database operations

## 🔄 Future Enhancements

1. **Payment Integration**: Real payment gateway integration
2. **Real-time Updates**: WebSocket for real-time availability
3. **Booking Modifications**: Allow users to modify bookings
4. **Recurring Bookings**: Support for weekly/monthly bookings
5. **Waitlist System**: Queue for unavailable slots
6. **Mobile App**: Native mobile application
7. **Advanced Analytics**: Detailed booking analytics
8. **Multi-language Support**: Internationalization
9. **Booking Reminders**: SMS reminders
10. **Review System**: Post-booking reviews and ratings
