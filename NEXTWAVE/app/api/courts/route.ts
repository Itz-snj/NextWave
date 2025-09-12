import { NextRequest, NextResponse } from 'next/server'
import { dbConnect, Court } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const venue = searchParams.get('venue')
    const query: any = {}
    if (venue) query.venue = venue
    const courts = await Court.find(query).sort({ createdAt: -1 })
    return NextResponse.json(courts)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load courts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const data = await req.json()
    // data: { venue, name, sport, basePricePerHour }
    const created = await Court.create(data)
    return NextResponse.json(created, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create court' }, { status: 400 })
  }
}
