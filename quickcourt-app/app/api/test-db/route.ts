import { NextRequest, NextResponse } from 'next/server'
import { dbConnect, User, Venue, Court, Booking } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Testing database connection...")
    
    await dbConnect()
    console.log("✅ Database connected successfully")
    
    // Test basic operations
    const userCount = await User.countDocuments()
    const venueCount = await Venue.countDocuments()
    const courtCount = await Court.countDocuments()
    const bookingCount = await Booking.countDocuments()
    
    console.log("📊 Database stats:")
    console.log("- Users:", userCount)
    console.log("- Venues:", venueCount)
    console.log("- Courts:", courtCount)
    console.log("- Bookings:", bookingCount)
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      stats: {
        users: userCount,
        venues: venueCount,
        courts: courtCount,
        bookings: bookingCount
      }
    })
  } catch (error: any) {
    console.error("❌ Database test failed:", error)
    return NextResponse.json({
      success: false,
      error: error?.message || "Database connection failed",
      details: error
    }, { status: 500 })
  }
}
