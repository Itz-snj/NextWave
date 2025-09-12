import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Report, Alert, User, Venue } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    // Report statistics
    const totalReports = await Report.countDocuments({})
    const pendingReports = await Report.countDocuments({ status: 'pending' })
    const resolvedReports = await Report.countDocuments({ status: 'resolved' })

    // Alert statistics
    const activeAlerts = await Alert.countDocuments({ isActive: true })

    // User moderation statistics (assuming banned users have a banned field)
    const bannedUsers = await User.countDocuments({ role: 'banned' })
    const suspendedVenues = await Venue.countDocuments({ status: 'suspended' })

    // Reports by type
    const reportsByType = await Report.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    const totalReportsCount = reportsByType.reduce((sum, type) => sum + type.count, 0)
    const reportsByTypeData = reportsByType.map(type => ({
      type: type._id,
      count: type.count,
      percentage: Math.round((type.count / totalReportsCount) * 100)
    }))

    // Reports by priority
    const reportsByPriority = await Report.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    const reportsByPriorityData = reportsByPriority.map(priority => ({
      priority: priority._id,
      count: priority.count,
      percentage: Math.round((priority.count / totalReportsCount) * 100)
    }))

    return NextResponse.json({
      totalReports,
      pendingReports,
      resolvedReports,
      activeAlerts,
      bannedUsers,
      suspendedVenues,
      reportsByType: reportsByTypeData,
      reportsByPriority: reportsByPriorityData
    })
  } catch (error) {
    console.error('Error fetching moderation stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch moderation statistics' },
      { status: 500 }
    )
  }
}
