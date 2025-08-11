import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Alert } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const alerts = await Alert.find({})
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const body = await request.json()

    const { type, title, message, category, priority } = body

    // Validate input
    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const alert = new Alert({
      type,
      title,
      message,
      category: category || 'system',
      priority: priority || 'medium',
      isActive: true
    })

    await alert.save()

    return NextResponse.json({ alert })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}
