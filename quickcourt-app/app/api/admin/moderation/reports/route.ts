import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Report, User } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const reports = await Report.find({})
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}
