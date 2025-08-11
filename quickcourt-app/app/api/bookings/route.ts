import { NextRequest, NextResponse } from 'next/server'
import { dbConnect, Booking } from '@/lib/db'

// GET /api/bookings?user=<userId>
export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const user = searchParams.get('user')
    const venue = searchParams.get('venue')
    const owner = searchParams.get('owner')
    const query: any = {}
    if (user) query.user = user
    if (venue) query.venue = venue
    // owner filter: join through venue.owner if provided by passing owner=<ownerId>
    // Fallback approach: fetch then filter since mongoose populate with match would be heavier here
    const bookings = await Booking.find(query)
      .populate('venue', 'name location owner')
      .populate('court', 'name sport')
      .sort({ createdAt: -1 })
    const filtered = owner ? bookings.filter((b: any) => String((b as any).venue?.owner) === String(owner)) : bookings
    return NextResponse.json(filtered)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load bookings' }, { status: 500 })
  }
}


