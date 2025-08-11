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

    const { status } = body

    // Validate input
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Update report status
    const updatedReport = await Report.findByIdAndUpdate(
      id,
      {
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
    console.error('Error updating report status:', error)
    return NextResponse.json(
      { error: 'Failed to update report status' },
      { status: 500 }
    )
  }
}
