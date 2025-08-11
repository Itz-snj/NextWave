import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Booking, User, Venue } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'comprehensive'
    const timeRange = searchParams.get('timeRange') || '30'
    const days = parseInt(timeRange)

    // Calculate date range
    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    let csvData = ''

    if (type === 'comprehensive' || type === 'bookings') {
      // Export bookings data
      const bookings = await Booking.find({ createdAt: { $gte: startDate } })
        .populate('user', 'name email')
        .populate('venue', 'name location')
        .populate('court', 'name sport')
        .lean()

      csvData += 'Booking ID,User,Venue,Court,Sport,Date,Time,Duration,Amount,Status,Created At\n'
      
      bookings.forEach(booking => {
        csvData += `${booking._id},${booking.user?.name || 'N/A'},${booking.venue?.name || 'N/A'},${booking.court?.name || 'N/A'},${booking.court?.sport || 'N/A'},${booking.date},${booking.time},${booking.duration},${booking.totalAmount},${booking.status},${booking.createdAt}\n`
      })
    }

    if (type === 'comprehensive' || type === 'users') {
      // Export users data
      const users = await User.find({ createdAt: { $gte: startDate } })
        .select('-password')
        .lean()

      csvData += '\nUser ID,Name,Email,Role,Verified,Created At\n'
      
      users.forEach(user => {
        csvData += `${user._id},${user.name},${user.email},${user.role},${user.isVerified},${user.createdAt}\n`
      })
    }

    if (type === 'comprehensive' || type === 'venues') {
      // Export venues data
      const venues = await Venue.find({ createdAt: { $gte: startDate } })
        .populate('owner', 'name email')
        .lean()

      csvData += '\nVenue ID,Name,Location,Sports,Status,Owner,Created At\n'
      
      venues.forEach(venue => {
        csvData += `${venue._id},${venue.name},${venue.location},${venue.sports?.join(';') || 'N/A'},${venue.status},${venue.owner?.name || 'N/A'},${venue.createdAt}\n`
      })
    }

    // Set response headers for CSV download
    const headers = new Headers()
    headers.set('Content-Type', 'text/csv')
    headers.set('Content-Disposition', `attachment; filename="${type}-report-${new Date().toISOString().split('T')[0]}.csv"`)

    return new NextResponse(csvData, {
      status: 200,
      headers
    })
  } catch (error) {
    console.error('Error exporting report:', error)
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    )
  }
}
