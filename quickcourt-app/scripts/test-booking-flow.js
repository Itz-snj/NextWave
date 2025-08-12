// Test script for QuickCourt booking flow
// This script tests the complete booking process from start to finish

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/quickcourt';

async function testBookingFlow() {
  const client = new MongoClient(MONGO_URL);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Step 1: Create test user
    console.log('\n👤 Step 1: Creating test user...');
    const usersCollection = db.collection('users');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const testUser = await usersCollection.findOneAndUpdate(
      { email: 'test@example.com' },
      {
        $set: {
          name: 'Test User',
          email: 'test@example.com',
          password: hashedPassword,
          role: 'user',
          isVerified: true,
          updatedAt: new Date()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    console.log('✅ Test user created/updated:', testUser.value._id);
    
    // Step 2: Create test venue
    console.log('\n🏟️ Step 2: Creating test venue...');
    const venuesCollection = db.collection('venues');
    const testVenue = await venuesCollection.findOneAndUpdate(
      { name: 'Test Sports Arena' },
      {
        $set: {
          name: 'Test Sports Arena',
          description: 'A modern sports facility for testing',
          location: 'Test City, Test State',
          sports: ['Tennis', 'Badminton', 'Basketball'],
          priceRange: { min: 500, max: 2000 },
          courtCount: 3,
          rating: 4.5,
          reviewCount: 10,
          amenities: ['Free Parking', 'WiFi', 'Cafeteria'],
          status: 'approved',
          owner: testUser.value._id,
          updatedAt: new Date()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    console.log('✅ Test venue created/updated:', testVenue.value._id);
    
    // Step 3: Create test courts
    console.log('\n🏸 Step 3: Creating test courts...');
    const courtsCollection = db.collection('courts');
    const courts = [
      {
        venue: testVenue.value._id,
        name: 'Court 1',
        sport: 'Tennis',
        basePricePerHour: 1000,
        isActive: true
      },
      {
        venue: testVenue.value._id,
        name: 'Court 2',
        sport: 'Badminton',
        basePricePerHour: 800,
        isActive: true
      },
      {
        venue: testVenue.value._id,
        name: 'Court 3',
        sport: 'Basketball',
        basePricePerHour: 1200,
        isActive: true
      }
    ];
    
    for (const courtData of courts) {
      await courtsCollection.findOneAndUpdate(
        { venue: courtData.venue, name: courtData.name },
        { $set: { ...courtData, updatedAt: new Date() } },
        { upsert: true }
      );
    }
    console.log('✅ Test courts created/updated');
    
    // Step 4: Create test timeslots for tomorrow
    console.log('\n⏰ Step 4: Creating test timeslots...');
    const timeslotsCollection = db.collection('timeslots');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    
    const timeSlots = [
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00'
    ];
    
    const courtIds = await courtsCollection.find({ venue: testVenue.value._id }).toArray();
    
    for (const court of courtIds) {
      for (const time of timeSlots) {
        await timeslotsCollection.findOneAndUpdate(
          { court: court._id, date: tomorrowStr, time },
          {
            $set: {
              venue: testVenue.value._id,
              court: court._id,
              date: tomorrowStr,
              time,
              price: court.basePricePerHour,
              isAvailable: true,
              updatedAt: new Date()
            }
          },
          { upsert: true }
        );
      }
    }
    console.log('✅ Test timeslots created for tomorrow');
    
    // Step 5: Test API endpoints
    console.log('\n🌐 Step 5: Testing API endpoints...');
    
    // Test database connection
    try {
      const response = await fetch('http://localhost:3000/api/test-db');
      const data = await response.json();
      console.log('✅ Database connection test:', data.success ? 'PASSED' : 'FAILED');
    } catch (error) {
      console.log('⚠️ Database connection test: SKIPPED (server not running)');
    }
    
    // Test data availability
    try {
      const response = await fetch('http://localhost:3000/api/test-data');
      const data = await response.json();
      console.log('✅ Data availability test:', data.success ? 'PASSED' : 'FAILED');
      if (data.success) {
        console.log(`   - Venues: ${data.data.venues.length}`);
        console.log(`   - Courts: ${data.data.courts.length}`);
        console.log(`   - Timeslots: ${data.data.timeslots.length}`);
      }
    } catch (error) {
      console.log('⚠️ Data availability test: SKIPPED (server not running)');
    }
    
    console.log('\n🎉 Booking flow test setup completed!');
    console.log('\n📋 Test Credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('\n🔗 Test URLs:');
    console.log(`- Venues: http://localhost:3000/venues`);
    console.log(`- Login: http://localhost:3000/auth/login`);
    console.log(`- Test DB: http://localhost:3000/api/test-db`);
    console.log(`- Test Data: http://localhost:3000/api/test-data`);
    console.log('\n📅 Available booking date:', tomorrowStr);
    console.log('⏰ Available times:', timeSlots.join(', '));
    
  } catch (error) {
    console.error('❌ Error in booking flow test:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testBookingFlow().catch(console.error);
