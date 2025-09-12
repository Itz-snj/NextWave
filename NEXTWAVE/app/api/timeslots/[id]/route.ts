import { NextRequest, NextResponse } from 'next/server'
import { dbConnect, TimeSlot } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect()
  const data = await req.json()
  const updated = await TimeSlot.findByIdAndUpdate(params.id, data, { new: true })
  if (!updated) return NextResponse.json({ error: 'TimeSlot not found' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect()
  const removed = await TimeSlot.findByIdAndDelete(params.id)
  if (!removed) return NextResponse.json({ error: 'TimeSlot not found' }, { status: 404 })
  return NextResponse.json({ message: 'TimeSlot deleted' })
}
