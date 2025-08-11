import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { User } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    // Get current date and calculate date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Get total counts
    const totalUsers = await User.countDocuments({ role: 'user' })
    const totalOwners = await User.countDocuments({ role: 'owner' })
    const totalAdmins = await User.countDocuments({ role: 'admin' })
    const verifiedUsers = await User.countDocuments({ isVerified: true })
    const unverifiedUsers = await User.countDocuments({ isVerified: false })

    // Get new users this month
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    })

    // Get active users (users who have logged in within last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo }
    })

    return NextResponse.json({
      totalUsers,
      totalOwners,
      totalAdmins,
      verifiedUsers,
      unverifiedUsers,
      activeUsers,
      newUsersThisMonth
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    )
  }
}
