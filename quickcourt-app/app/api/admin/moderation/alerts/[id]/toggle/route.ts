import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Alert } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    const { id } = params
    const body = await request.json()

    const { isActive } = body

    // Validate input
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean' },
        { status: 400 }
      )
    }

    // Update alert status
    const updatedAlert = await Alert.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    )

    if (!updatedAlert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ alert: updatedAlert })
  } catch (error) {
    console.error('Error toggling alert:', error)
    return NextResponse.json(
      { error: 'Failed to toggle alert' },
      { status: 500 }
    )
  }
}
