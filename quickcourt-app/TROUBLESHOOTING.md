# QuickCourt Booking System - Troubleshooting Guide

## 🚨 Booking Still Failing? Let's Debug Step by Step

### Step 1: Check Database Connection

First, test if your database is connected properly:

```bash
# Visit this URL in your browser
http://localhost:3000/api/test-db
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "stats": {
    "users": 1,
    "venues": 1,
    "courts": 3,
    "bookings": 0
  }
}
```

**If this fails:**
- Check your `MONGO_URL` environment variable
- Make sure MongoDB is running
- Verify the connection string format

### Step 2: Check Test Data Availability

Test if you have venues and courts in your database:

```bash
# Visit this URL in your browser
http://localhost:3000/api/test-data
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Data availability test completed",
  "data": {
    "venues": [...],
    "courts": [...],
    "timeslots": [...]
  }
}
```

**If this returns empty arrays:**
- Run the test data setup script (see Step 3)

### Step 3: Set Up Test Data

If you don't have test data, run this script:

```bash
cd quickcourt-app
node scripts/setup-test-data.js
```

This will create:
- Test user: `test@example.com` / `password123`
- Test venue: "Test Sports Arena"
- 3 test courts (Tennis, Badminton, Basketball)
- Timeslots for tomorrow

### Step 4: Test the Complete Booking Flow

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Login with test credentials:**
   - Go to: `http://localhost:3000/auth/login`
   - Email: `test@example.com`
   - Password: `password123`

3. **Browse venues:**
   - Go to: `http://localhost:3000/venues`
   - Click on "Test Sports Arena"

4. **Select a court:**
   - Click on any court (e.g., "Court 1")
   - This should take you to the booking page

5. **Make a booking:**
   - Select tomorrow's date
   - Select a time slot
   - Select duration
   - Click "Book & Pay"

### Step 5: Check Console Logs

Open your browser's Developer Tools (F12) and check the Console tab. You should see detailed logs like:

```
🔍 Loading venue and court data...
🔍 Venue ID: 507f1f77bcf86cd799439011
🔍 Court ID: 507f1f77bcf86cd799439012
📡 Fetching venue details...
📡 Venue response status: 200
✅ Venue data loaded: {_id: "...", name: "Test Sports Arena", ...}
📡 Fetching court details...
📡 Court response status: 200
✅ Court data loaded: {_id: "...", name: "Court 1", ...}
```

### Step 6: Check API Logs

In your terminal where you're running `npm run dev`, you should see logs like:

```
🔍 Booking confirmation request received
✅ Database connected successfully
📦 Received booking data: {...}
✅ All required fields validated
📝 Creating booking with payload: {...}
✅ Booking created successfully: 507f1f77bcf86cd799439013
✅ Timeslot updated: found and updated
📧 Preparing email data: {...}
📧 Email sending result: true
🎉 Booking confirmation completed successfully
```

### Common Issues and Solutions

#### Issue 1: "Missing required fields" Error
**Symptoms:** API returns 400 error with missing fields
**Solution:** Check that all required data is being sent:
- `userId` - Make sure user is logged in
- `venueId` - Make sure venue exists
- `courtId` - Make sure court exists
- `date` - Make sure date is selected
- `time` - Make sure time slot is selected
- `totalAmount` - Make sure price is calculated

#### Issue 2: "Venue not found" or "Court not found" Error
**Symptoms:** 404 errors when loading venue/court data
**Solution:** 
- Run the test data setup script
- Check that venue and court IDs in the URL are valid
- Verify the venue and court exist in the database

#### Issue 3: "Database connection failed" Error
**Symptoms:** 500 error with database connection issues
**Solution:**
- Check your `MONGO_URL` environment variable
- Make sure MongoDB is running
- Test the database connection: `http://localhost:3000/api/test-db`

#### Issue 4: "User not authenticated" Error
**Symptoms:** User ID is undefined
**Solution:**
- Make sure user is logged in
- Check that the login API is working
- Verify the user object structure in AuthContext

#### Issue 5: "No available time slots" Error
**Symptoms:** No time slots shown for selected date
**Solution:**
- Run the test data setup script to create timeslots
- Check that timeslots exist for the selected date
- Verify the timeslot API is working: `http://localhost:3000/api/timeslots?venue=...&court=...&date=...`

### Environment Variables Required

Create a `.env.local` file in the `quickcourt-app` directory:

```env
MONGO_URL=mongodb://localhost:27017/quickcourt
NEXT_PUBLIC_APP_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@quickcourt.com
```

### Testing Checklist

- [ ] Database connection works (`/api/test-db`)
- [ ] Test data exists (`/api/test-data`)
- [ ] User can log in
- [ ] Venues page loads
- [ ] Venue details page loads
- [ ] Court selection works
- [ ] Booking page loads with venue/court data
- [ ] Date selection works
- [ ] Time slots load for selected date
- [ ] Duration selection works
- [ ] Total price calculates correctly
- [ ] "Book & Pay" button is enabled
- [ ] Booking API call succeeds
- [ ] Success message shows
- [ ] User is redirected to bookings page
- [ ] Booking appears in user's bookings list

### Still Having Issues?

If you're still experiencing problems:

1. **Check the browser console** for JavaScript errors
2. **Check the terminal logs** for API errors
3. **Test each API endpoint individually** using the test URLs
4. **Verify your MongoDB connection** and data
5. **Make sure all environment variables are set**

### Debug Mode

The booking system now has comprehensive logging enabled. Look for these emoji indicators in the logs:

- 🔍 Investigation/checking
- ✅ Success
- ❌ Error/failure
- 📡 Network request
- 📦 Data payload
- 📧 Email operations
- 🎉 Completion

This will help you identify exactly where the booking process is failing.
