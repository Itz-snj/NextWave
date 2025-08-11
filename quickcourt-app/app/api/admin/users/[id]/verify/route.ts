import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { User } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    const { id } = params
    const body = await request.json()

    const { isVerified } = body

    // Validate input
    if (typeof isVerified !== 'boolean') {
      return NextResponse.json(
        { error: 'isVerified must be a boolean' },
        { status: 400 }
      )
    }

    // Update user verification status
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isVerified },
      { new: true, runValidators: true }
    ).select('-password')

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating user verification:', error)
    return NextResponse.json(
      { error: 'Failed to update user verification' },
      { status: 500 }
    )
  }
}
