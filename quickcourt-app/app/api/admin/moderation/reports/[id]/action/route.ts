import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Report } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    const { id } = params
    const body = await request.json()

    const { action, moderatorNotes, status } = body

    // Validate input
    if (!action || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update report
    const updatedReport = await Report.findByIdAndUpdate(
      id,
      {
        action,
        moderatorNotes,
        status,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('reporter', 'name email')

    if (!updatedReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ report: updatedReport })
  } catch (error) {
    console.error('Error updating report action:', error)
    return NextResponse.json(
      { error: 'Failed to update report action' },
      { status: 500 }
    )
  }
}
