import { NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { Booking, Court, Venue } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    // Get owner ID from query params
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('ownerId')
    
    if (!ownerId) {
      return NextResponse.json({ error: "Owner ID is required" }, { status: 400 })
    }

    // Get owner's venues
    const venues = await Venue.find({ owner: ownerId })
    const venueIds = venues.map(venue => venue._id)

    // Get courts for these venues
    const courts = await Court.find({ venue: { $in: venueIds } })
    const courtIds = courts.map(court => court._id)

    // Get all bookings for this owner
    const allBookings = await Booking.find({ 
      court: { $in: courtIds },
      status: 'confirmed'
    }).populate('court')

    // 1. Booking Trends (last 6 months)
    const bookingTrends = []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const year = date.getFullYear()
      const month = date.getMonth()
      
      const monthStart = new Date(year, month, 1).toISOString().split('T')[0]
      const monthEnd = new Date(year, month + 1, 0).toISOString().split('T')[0]
      
      const monthBookings = allBookings.filter(booking => 
        booking.date >= monthStart && booking.date <= monthEnd
      )
      
      const bookings = monthBookings.length
      const earnings = monthBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)
      
      bookingTrends.push({
        month: months[month],
        bookings,
        earnings
      })
    }

    // 2. Sport Distribution
    const sportCounts: Record<string, number> = {}
    allBookings.forEach(booking => {
      const sport = booking.court.sport
      sportCounts[sport] = (sportCounts[sport] || 0) + 1
    })

    const sportColors: Record<string, string> = {
      'Badminton': '#8884d8',
      'Tennis': '#82ca9d',
      'Squash': '#ffc658',
      'Table Tennis': '#ff7300',
      'Basketball': '#ff6b6b',
      'Volleyball': '#4ecdc4',
      'Football': '#45b7d1',
      'Cricket': '#96ceb4'
    }

    const sportDistribution = Object.entries(sportCounts).map(([sport, count]) => ({
      name: sport,
      value: count,
      color: sportColors[sport] || '#8884d8'
    }))

    // 3. Peak Hours Analysis
    const hourCounts: Record<number, number> = {}
    for (let hour = 6; hour <= 22; hour++) {
      hourCounts[hour] = 0
    }

    allBookings.forEach(booking => {
      const hour = parseInt(booking.time.split(':')[0])
      if (hour >= 6 && hour <= 22) {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
      }
    })

    const peakHours = Object.entries(hourCounts).map(([hour, count]) => ({
      hour: `${hour}:00`,
      bookings: count
    }))

    // 4. Recent Bookings (last 10)
    const recentBookings = await Booking.find({ 
      court: { $in: courtIds },
      status: 'confirmed'
    })
    .populate('user', 'name')
    .populate('court', 'name sport')
    .populate('venue', 'name')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

    const formattedRecentBookings = recentBookings.map(booking => ({
      id: booking._id,
      customerName: booking.user.name,
      court: booking.court.name,
      sport: booking.court.sport,
      venue: booking.venue.name,
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
      amount: booking.totalAmount,
      status: booking.status
    }))

    return NextResponse.json({
      bookingTrends,
      sportDistribution,
      peakHours,
      recentBookings: formattedRecentBookings
    })

  } catch (error) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 })
  }
}
