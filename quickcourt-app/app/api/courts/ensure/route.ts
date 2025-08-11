import { NextRequest, NextResponse } from 'next/server'
import { dbConnect, Court, Venue } from '@/lib/db'

// POST /api/courts/ensure
// Body: { venue: string, count?: number, sport?: string, basePricePerHour?: number }
export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const body = await req.json()
    const venueId: string | undefined = body?.venue
    const count: number = Math.max(1, Number(body?.count ?? 1))
    const sport: string = String(body?.sport ?? 'General')
    const basePricePerHour: number = Number(body?.basePricePerHour ?? 0)

    if (!venueId) {
      return NextResponse.json({ error: 'venue is required' }, { status: 400 })
    }

    const venue = await Venue.findById(venueId)
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const existing = await Court.countDocuments({ venue: venueId })
    if (existing > 0) {
      const courts = await Court.find({ venue: venueId }).sort({ createdAt: 1 })
      return NextResponse.json({ created: 0, courts })
    }

    const toCreate = Array.from({ length: count }).map((_, idx) => ({
      venue: venueId,
      name: `Court ${idx + 1}`,
      sport,
      basePricePerHour,
    }))

    const created = await Court.insertMany(toCreate)
    // update venue.courtCount
    await Venue.findByIdAndUpdate(venueId, { $set: { courtCount: created.length } }, { new: true })
    return NextResponse.json({ created: created.length, courts: created }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to ensure courts' }, { status: 500 })
  }
}


