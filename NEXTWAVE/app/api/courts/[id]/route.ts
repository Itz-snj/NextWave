import { NextRequest, NextResponse } from 'next/server'
import { dbConnect, Court } from '@/lib/db'

// GET /api/courts/[id] - fetch a single court
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const court = await Court.findById(params.id)
    if (!court) return NextResponse.json({ error: 'Court not found' }, { status: 404 })
    return NextResponse.json(court)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load court' }, { status: 500 })
  }
}

// PUT /api/courts/[id] - replace/update a court
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const data = await req.json()
    const updated = await Court.findByIdAndUpdate(params.id, data, { new: true })
    if (!updated) return NextResponse.json({ error: 'Court not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update court' }, { status: 400 })
  }
}

// PATCH /api/courts/[id] - partial update
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const data = await req.json()
    const updated = await Court.findByIdAndUpdate(params.id, { $set: data }, { new: true })
    if (!updated) return NextResponse.json({ error: 'Court not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update court' }, { status: 400 })
  }
}

// DELETE /api/courts/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const deleted = await Court.findByIdAndDelete(params.id)
    if (!deleted) return NextResponse.json({ error: 'Court not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete court' }, { status: 400 })
  }
}


