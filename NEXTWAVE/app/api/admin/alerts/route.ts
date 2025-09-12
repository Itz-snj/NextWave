import { NextRequest, NextResponse } from 'next/server';
import { dbConnect, User, Venue, Booking } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth, 0);

    // Format dates for database queries
    const startDateStr = startOfMonth.toISOString().split('T')[0];
    const endDateStr = endOfMonth.toISOString().split('T')[0];
    const lastMonthStartStr = startOfLastMonth.toISOString().split('T')[0];
    const lastMonthEndStr = endOfLastMonth.toISOString().split('T')[0];

    // Fetch data for alerts
    const [
      currentMonthBookings,
      lastMonthBookings,
      totalUsers,
      currentMonthRevenue,
      lastMonthRevenue,
      pendingVenues
    ] = await Promise.all([
      // Current month bookings
      Booking.countDocuments({
        date: { $gte: startDateStr, $lte: endDateStr }
      }),
      
      // Last month bookings
      Booking.countDocuments({
        date: { $gte: lastMonthStartStr, $lte: lastMonthEndStr }
      }),
      
      // Total users
      User.countDocuments({ role: 'user' }),
      
      // Current month revenue
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
      
      // Last month revenue
      Booking.aggregate([
        {
          $match: {
            date: { $gte: lastMonthStartStr, $lte: lastMonthEndStr },
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
      
      // Pending venues
      Venue.countDocuments({ status: 'pending' })
    ]);

    const currentRevenue = currentMonthRevenue[0]?.totalRevenue || 0;
    const lastRevenue = lastMonthRevenue[0]?.totalRevenue || 0;
    
    // Calculate percentage changes
    const bookingChange = lastMonthBookings > 0 
      ? ((currentMonthBookings - lastMonthBookings) / lastMonthBookings) * 100 
      : 0;
    
    const revenueChange = lastRevenue > 0 
      ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 
      : 0;

    const alerts = [];

    // High booking volume alert
    if (bookingChange > 20) {
      alerts.push({
        type: 'warning',
        title: 'High Booking Volume',
        message: `Booking volume is ${Math.abs(bookingChange).toFixed(0)}% ${bookingChange > 0 ? 'higher' : 'lower'} than last month`,
        icon: 'AlertCircle'
      });
    }

    // User milestone alert
    if (totalUsers >= 250) {
      alerts.push({
        type: 'info',
        title: 'User Milestone',
        message: `Platform has reached ${totalUsers}+ registered users`,
        icon: 'Users'
      });
    }

    // Revenue growth alert
    if (revenueChange > 10) {
      alerts.push({
        type: 'success',
        title: 'Revenue Growth',
        message: `Monthly revenue ${revenueChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(revenueChange).toFixed(0)}% this month`,
        icon: 'TrendingUp'
      });
    }

    // Pending approvals alert
    if (pendingVenues > 0) {
      alerts.push({
        type: 'warning',
        title: 'Pending Approvals',
        message: `${pendingVenues} venue${pendingVenues > 1 ? 's' : ''} awaiting approval`,
        icon: 'AlertCircle'
      });
    }

    // Low activity alert (if bookings are very low)
    if (currentMonthBookings < 10 && lastMonthBookings > 0) {
      alerts.push({
        type: 'warning',
        title: 'Low Activity',
        message: 'Booking activity is significantly lower than usual',
        icon: 'AlertCircle'
      });
    }

    // If no alerts, add a general status
    if (alerts.length === 0) {
      alerts.push({
        type: 'success',
        title: 'System Status',
        message: 'All systems operating normally',
        icon: 'CheckCircle'
      });
    }

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching system alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system alerts' },
      { status: 500 }
    );
  }
}
