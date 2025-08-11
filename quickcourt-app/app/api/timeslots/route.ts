import { NextRequest, NextResponse } from 'next/server'
import { dbConnect, TimeSlot } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const venue = searchParams.get('venue')
    const court = searchParams.get('court')
    const date = searchParams.get('date') // YYYY-MM-DD
    const cleanup = searchParams.get('cleanup') === '1' || searchParams.get('cleanup') === 'true'

    const query: any = {}
    if (venue) query.venue = venue
    if (court) query.court = court
    if (date) query.date = date

    // Hide past-time slots for requested date
    if (date) {
      const now = new Date()
      const todayStr = now.toISOString().slice(0, 10)
      const nowTime = now.toTimeString().slice(0, 5) // HH:mm
      if (date < todayStr) {
        // Optionally cleanup all past for that date
        if (cleanup) {
          await TimeSlot.deleteMany({ date: { $lt: todayStr } })
        }
        return NextResponse.json([])
      }
      if (date === todayStr) {
        query.time = { $gte: nowTime }
        if (cleanup) {
          await TimeSlot.deleteMany({ date: todayStr, time: { $lt: nowTime } })
        }
      }
    }

    const slots = await TimeSlot.find(query).sort({ time: 1 })
    return NextResponse.json(slots)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load timeslots' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const data = await req.json()
    // data: { venue, court, date, time, price, isAvailable }
    const created = await TimeSlot.create(data)
    return NextResponse.json(created, { status: 201 })
  } catch (e: any) {
    const message = e?.code === 11000 ? 'Duplicate slot for this court/date/time' : (e?.message || 'Failed to create timeslot')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
