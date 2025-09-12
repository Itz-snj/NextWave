import { NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { Booking, Court, Venue, User } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    // Get owner ID from query params or headers
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('ownerId')
    
    if (!ownerId) {
      return NextResponse.json({ error: "Owner ID is required" }, { status: 400 })
    }

    // Get current date for calculations
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // Get owner's venues
    const venues = await Venue.find({ owner: ownerId })
    const venueIds = venues.map(venue => venue._id)

    // Get courts for these venues
    const courts = await Court.find({ venue: { $in: venueIds } })
    const courtIds = courts.map(court => court._id)

    // Calculate total bookings
    const totalBookings = await Booking.countDocuments({ court: { $in: courtIds } })

    // Calculate active courts
    const activeCourts = await Court.countDocuments({ 
      venue: { $in: venueIds }, 
      isActive: true 
    })

    // Calculate monthly earnings
    const currentMonthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
    
    const monthlyBookings = await Booking.find({
      court: { $in: courtIds },
      date: { $gte: currentMonthStart, $lte: currentMonthEnd },
      status: 'confirmed'
    })

    const monthlyEarnings = monthlyBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)

    // Calculate last month earnings for comparison
    const lastMonthStart = new Date(lastMonthYear, lastMonth, 1).toISOString().split('T')[0]
    const lastMonthEnd = new Date(lastMonthYear, lastMonth + 1, 0).toISOString().split('T')[0]
    
    const lastMonthBookings = await Booking.find({
      court: { $in: courtIds },
      date: { $gte: lastMonthStart, $lte: lastMonthEnd },
      status: 'confirmed'
    })

    const lastMonthEarnings = lastMonthBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)
    const earningsGrowth = lastMonthEarnings > 0 ? ((monthlyEarnings - lastMonthEarnings) / lastMonthEarnings * 100).toFixed(1) : 0

    // Calculate total unique customers
    const uniqueCustomers = await Booking.distinct('user', { court: { $in: courtIds } })
    const totalCustomers = uniqueCustomers.length

    // Calculate new customers this month
    const newCustomersThisMonth = await Booking.distinct('user', {
      court: { $in: courtIds },
      date: { $gte: currentMonthStart, $lte: currentMonthEnd },
      status: 'confirmed'
    })

    // Calculate booking growth
    const lastMonthTotalBookings = await Booking.countDocuments({
      court: { $in: courtIds },
      date: { $gte: lastMonthStart, $lte: lastMonthEnd }
    })

    const bookingGrowth = lastMonthTotalBookings > 0 ? ((totalBookings - lastMonthTotalBookings) / lastMonthTotalBookings * 100).toFixed(1) : 0

    return NextResponse.json({
      totalBookings,
      activeCourts,
      monthlyEarnings,
      totalCustomers,
      earningsGrowth: `${earningsGrowth}%`,
      bookingGrowth: `${bookingGrowth}%`,
      newCustomersThisMonth: newCustomersThisMonth.length
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
