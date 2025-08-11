import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { User } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean()

    // Add additional user statistics
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // You can add more user statistics here if needed
        // For now, we'll just return the basic user data
        return {
          ...user,
          lastLogin: user.lastLogin || null,
          totalBookings: 0, // This would be calculated from bookings collection
          totalSpent: 0, // This would be calculated from bookings collection
        }
      })
    )

    return NextResponse.json({ users: usersWithStats })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
