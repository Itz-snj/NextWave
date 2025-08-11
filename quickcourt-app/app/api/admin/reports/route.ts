import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { User, Venue, Booking, Court } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30'
    const days = parseInt(timeRange)

    // Calculate date ranges
    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const previousStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000)

    // Revenue data
    const currentRevenue = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])

    const previousRevenue = await Booking.aggregate([
      { $match: { createdAt: { $gte: previousStartDate, $lt: startDate } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])

    const totalRevenue = currentRevenue[0]?.total || 0
    const previousTotalRevenue = previousRevenue[0]?.total || 0
    const revenueGrowth = previousTotalRevenue > 0 
      ? ((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100 
      : 0

    // Booking data
    const currentBookings = await Booking.countDocuments({ createdAt: { $gte: startDate } })
    const previousBookings = await Booking.countDocuments({ 
      createdAt: { $gte: previousStartDate, $lt: startDate } 
    })
    const bookingGrowth = previousBookings > 0 
      ? ((currentBookings - previousBookings) / previousBookings) * 100 
      : 0

    // User data
    const currentUsers = await User.countDocuments({ createdAt: { $gte: startDate } })
    const previousUsers = await User.countDocuments({ 
      createdAt: { $gte: previousStartDate, $lt: startDate } 
    })
    const userGrowth = previousUsers > 0 
      ? ((currentUsers - previousUsers) / previousUsers) * 100 
      : 0

    // Generate monthly data for charts
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthRevenue = await Booking.aggregate([
        { $match: { createdAt: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])

      const monthBookings = await Booking.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      })

      const monthUsers = await User.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      })

      const monthOwners = await User.countDocuments({
        role: 'owner',
        createdAt: { $gte: monthStart, $lte: monthEnd }
      })

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthRevenue[0]?.total || 0,
        bookings: monthBookings,
        users: monthUsers,
        owners: monthOwners
      })
    }

    // Sport popularity
    const sportData = await Court.aggregate([
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    const totalCourts = sportData.reduce((sum, sport) => sum + sport.count, 0)
    const sportPopularity = sportData.map((sport, index) => ({
      sport: sport._id,
      count: sport.count,
      percentage: Math.round((sport.count / totalCourts) * 100),
      color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000'][index % 5]
    }))

    // Venue performance
    const venuePerformance = await Venue.aggregate([
      { $lookup: { from: 'bookings', localField: '_id', foreignField: 'venue', as: 'bookings' } },
      { $lookup: { from: 'users', localField: 'owner', foreignField: '_id', as: 'owner' } },
      {
        $project: {
          name: 1,
          location: 1,
          totalBookings: { $size: '$bookings' },
          totalRevenue: { $sum: '$bookings.totalAmount' },
          averageRating: { $ifNull: ['$rating', 0] },
          ownerName: { $arrayElemAt: ['$owner.name', 0] }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ])

    // Recent bookings
    const recentBookings = await Booking.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $lookup: { from: 'venues', localField: 'venue', foreignField: '_id', as: 'venue' }
      },
      {
        $lookup: { from: 'courts', localField: 'court', foreignField: '_id', as: 'court' }
      },
      {
        $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' }
      },
      {
        $project: {
          id: '$_id',
          venueName: { $arrayElemAt: ['$venue.name', 0] },
          courtName: { $arrayElemAt: ['$court.name', 0] },
          userName: { $arrayElemAt: ['$user.name', 0] },
          date: '$date',
          time: '$time',
          amount: '$totalAmount',
          status: '$status'
        }
      }
    ])

    // User role distribution
    const userRoles = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ])

    const totalUsers = userRoles.reduce((sum, role) => sum + role.count, 0)
    const userRoleData = userRoles.map((role, index) => ({
      role: role._id,
      count: role.count,
      percentage: Math.round((role.count / totalUsers) * 100),
      color: ['#8884d8', '#82ca9d', '#ffc658'][index % 3]
    }))

    // Venue status distribution
    const venueStatus = await Venue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    const totalVenues = venueStatus.reduce((sum, status) => sum + status.count, 0)
    const venueStatusData = venueStatus.map((status, index) => ({
      status: status._id,
      count: status.count,
      percentage: Math.round((status.count / totalVenues) * 100),
      color: ['#82ca9d', '#ffc658'][index % 2]
    }))

    return NextResponse.json({
      revenue: {
        total: totalRevenue,
        monthly: totalRevenue,
        growth: Math.round(revenueGrowth * 100) / 100,
        trend: monthlyData.map(d => ({ month: d.month, revenue: d.revenue }))
      },
      bookings: {
        total: currentBookings,
        monthly: currentBookings,
        growth: Math.round(bookingGrowth * 100) / 100,
        trend: monthlyData.map(d => ({ month: d.month, bookings: d.bookings })),
        bySport: sportPopularity,
        byVenue: venuePerformance.map(v => ({ 
          venue: v.name, 
          count: v.totalBookings, 
          revenue: v.totalRevenue 
        }))
      },
      users: {
        total: currentUsers,
        monthly: currentUsers,
        growth: Math.round(userGrowth * 100) / 100,
        trend: monthlyData.map(d => ({ month: d.month, users: d.users, owners: d.owners })),
        byRole: userRoleData
      },
      venues: {
        total: totalVenues,
        active: venueStatus.find(s => s._id === 'approved')?.count || 0,
        pending: venueStatus.find(s => s._id === 'pending')?.count || 0,
        byStatus: venueStatusData,
        topPerformers: venuePerformance
      },
      topVenues: venuePerformance.map(v => ({
        id: v._id,
        name: v.name,
        location: v.location,
        totalBookings: v.totalBookings,
        totalRevenue: v.totalRevenue,
        averageRating: v.averageRating,
        ownerName: v.ownerName
      })),
      recentBookings
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}
