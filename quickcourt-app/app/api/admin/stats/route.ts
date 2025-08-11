import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, User, Venue, Court, Booking } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get current date for calculations
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Format dates for database queries (YYYY-MM-DD)
    const startDateStr = startOfMonth.toISOString().split('T')[0];
    const endDateStr = endOfMonth.toISOString().split('T')[0];

    // Fetch all statistics in parallel
    const [
      totalUsers,
      totalOwners,
      totalBookings,
      totalCourts,
      pendingApprovals,
      monthlyRevenue,
      userGrowthData,
      ownerGrowthData,
      bookingActivityData,
      sportPopularityData,
      revenueData,
      recentVenues
    ] = await Promise.all([
      // Total users (excluding admins)
      User.countDocuments({ role: 'user' }),
      
      // Total owners
      User.countDocuments({ role: 'owner' }),
      
      // Total bookings
      Booking.countDocuments(),
      
      // Total courts
      Court.countDocuments({ isActive: true }),
      
      // Pending venue approvals
      Venue.countDocuments({ status: 'pending' }),
      
      // Monthly revenue
      Booking.aggregate([
        {
          $match: {
            date: { $gte: startDateStr, $lte: endDateStr },
            status: 'confirmed'
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' }
          }
        }
      ]),
      
      // User growth data (last 6 months)
      User.aggregate([
        {
          $match: {
            role: 'user',
            createdAt: { $gte: new Date(currentYear, currentMonth - 5, 1) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            users: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]),
      
      // Owner growth data (last 6 months)
      User.aggregate([
        {
          $match: {
            role: 'owner',
            createdAt: { $gte: new Date(currentYear, currentMonth - 5, 1) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            owners: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]),
      
      // Booking activity data (last 6 months)
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(currentYear, currentMonth - 5, 1) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            bookings: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]),
      
      // Sport popularity data
      Booking.aggregate([
        {
          $lookup: {
            from: 'courts',
            localField: 'court',
            foreignField: '_id',
            as: 'courtData'
          }
        },
        {
          $unwind: '$courtData'
        },
        {
          $group: {
            _id: '$courtData.sport',
            value: { $sum: 1 }
          }
        },
        {
          $sort: { value: -1 }
        }
      ]),
      
      // Revenue data (last 6 months)
      Booking.aggregate([
        {
          $match: {
            status: 'confirmed',
            createdAt: { $gte: new Date(currentYear, currentMonth - 5, 1) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$totalAmount' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]),
      
      // Recent venue approvals
      Venue.find({ status: 'pending' })
        .populate('owner', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Process monthly revenue
    const monthlyRevenueAmount = monthlyRevenue[0]?.totalRevenue || 0;

    // Process chart data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Create user growth chart data
    const userGrowth = monthNames.slice(currentMonth - 5, currentMonth + 1).map((month, index) => {
      const monthData = userGrowthData.find(d => d._id.month === currentMonth - 5 + index + 1);
      const ownerData = ownerGrowthData.find(d => d._id.month === currentMonth - 5 + index + 1);
      return {
        month,
        users: monthData?.users || 0,
        owners: ownerData?.owners || 0
      };
    });

    // Create booking activity chart data
    const bookingActivity = monthNames.slice(currentMonth - 5, currentMonth + 1).map((month, index) => {
      const monthData = bookingActivityData.find(d => d._id.month === currentMonth - 5 + index + 1);
      return {
        month,
        bookings: monthData?.bookings || 0
      };
    });

    // Create sport popularity chart data
    const sportColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000', '#0000ff'];
    const sportPopularity = sportPopularityData.map((sport, index) => ({
      name: sport._id,
      value: sport.value,
      color: sportColors[index % sportColors.length]
    }));

    // Create revenue chart data
    const revenueChartData = monthNames.slice(currentMonth - 5, currentMonth + 1).map((month, index) => {
      const monthData = revenueData.find(d => d._id.month === currentMonth - 5 + index + 1);
      return {
        month,
        revenue: monthData?.revenue || 0
      };
    });

    // Process recent venues
    const processedRecentVenues = recentVenues.map(venue => ({
      id: venue._id,
      name: venue.name,
      location: venue.location,
      courtCount: venue.courtCount,
      status: venue.status,
      ownerName: venue.owner?.name || 'Unknown',
      createdAt: venue.createdAt
    }));

    const stats = {
      totalUsers,
      totalOwners,
      totalBookings,
      totalCourts,
      pendingApprovals,
      monthlyRevenue: monthlyRevenueAmount,
      userGrowth,
      bookingActivity,
      sportPopularity,
      revenueData: revenueChartData,
      recentVenues: processedRecentVenues
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
