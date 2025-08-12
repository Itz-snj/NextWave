// Test data setup script for QuickCourt booking system
// Run this script to create sample venues, courts, and timeslots for testing

const { MongoClient } = require('mongodb');

// MongoDB connection string - replace with your actual connection string
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/quickcourt';

async function setupTestData() {
  const client = new MongoClient(MONGO_URL);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Create sample user
    const usersCollection = db.collection('users');
    const existingUser = await usersCollection.findOne({ email: 'test@example.com' });
    
    if (!existingUser) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const testUser = await usersCollection.insertOne({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Created test user:', testUser.insertedId);
    } else {
      console.log('ℹ️ Test user already exists');
    }
    
    // Create sample venue
    const venuesCollection = db.collection('venues');
    const existingVenue = await venuesCollection.findOne({ name: 'Test Sports Arena' });
    
    let venueId;
    if (!existingVenue) {
      const testVenue = await venuesCollection.insertOne({
        name: 'Test Sports Arena',
        description: 'A modern sports facility with multiple courts',
        location: '123 Sports Street, Test City',
        sports: ['Tennis', 'Badminton', 'Basketball'],
        priceRange: { min: 500, max: 2000 },
        courtCount: 3,
        rating: 4.5,
        reviewCount: 10,
        images: [],
        amenities: ['Parking', 'Shower', 'Equipment Rental'],
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      venueId = testVenue.insertedId;
      console.log('✅ Created test venue:', venueId);
    } else {
      venueId = existingVenue._id;
      console.log('ℹ️ Test venue already exists:', venueId);
    }
    
    // Create sample courts
    const courtsCollection = db.collection('courts');
    const existingCourts = await courtsCollection.find({ venue: venueId }).toArray();
    
    if (existingCourts.length === 0) {
      const testCourts = [
        {
          venue: venueId,
          name: 'Court 1',
          sport: 'Tennis',
          basePricePerHour: 800,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          venue: venueId,
          name: 'Court 2',
          sport: 'Badminton',
          basePricePerHour: 500,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          venue: venueId,
          name: 'Court 3',
          sport: 'Basketball',
          basePricePerHour: 1000,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      const courtResults = await courtsCollection.insertMany(testCourts);
      console.log('✅ Created test courts:', Object.values(courtResults.insertedIds));
      
      // Create sample timeslots for tomorrow
      const timeslotsCollection = db.collection('timeslots');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const timeslots = [];
      Object.values(courtResults.insertedIds).forEach(courtId => {
        for (let hour = 8; hour <= 20; hour++) {
          timeslots.push({
            venue: venueId,
            court: courtId,
            date: tomorrowStr,
            time: `${hour.toString().padStart(2, '0')}:00`,
            price: hour < 12 ? 600 : 800,
            isAvailable: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      });
      
      await timeslotsCollection.insertMany(timeslots);
      console.log('✅ Created test timeslots for tomorrow');
      
    } else {
      console.log('ℹ️ Test courts already exist');
    }
    
    console.log('\n🎉 Test data setup completed!');
    console.log('\n📋 Test Credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('\n🔗 Test URLs:');
    console.log(`- Venues: http://localhost:3000/venues`);
    console.log(`- Login: http://localhost:3000/auth/login`);
    console.log(`- Test DB: http://localhost:3000/api/test-db`);
    console.log(`- Test Data: http://localhost:3000/api/test-data`);
    
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the setup
setupTestData().catch(console.error);
