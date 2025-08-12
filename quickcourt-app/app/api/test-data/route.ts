import { NextRequest, NextResponse } from 'next/server'
import { dbConnect, Venue, Court, TimeSlot } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Testing data availability...")
    
    await dbConnect()
    console.log("✅ Database connected successfully")
    
    // Get sample venues
    const venues = await Venue.find().limit(5)
    console.log("📊 Found venues:", venues.length)
    
    // Get sample courts
    const courts = await Court.find().limit(10)
    console.log("📊 Found courts:", courts.length)
    
    // Get sample timeslots
    const timeslots = await TimeSlot.find().limit(10)
    console.log("📊 Found timeslots:", timeslots.length)
    
    return NextResponse.json({
      success: true,
      message: "Data availability test completed",
      data: {
        venues: venues.map(v => ({ id: v._id, name: v.name, location: v.location })),
        courts: courts.map(c => ({ id: c._id, name: c.name, sport: c.sport, venue: c.venue })),
        timeslots: timeslots.map(t => ({ id: t._id, court: t.court, date: t.date, time: t.time, isAvailable: t.isAvailable }))
      }
    })
  } catch (error: any) {
    console.error("❌ Data test failed:", error)
    return NextResponse.json({
      success: false,
      error: error?.message || "Data test failed",
      details: error
    }, { status: 500 })
  }
}
