import { dbConnect, Venue } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/venues/[id] - Get a single venue
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const venue = await Venue.findById(params.id);
  if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
  return NextResponse.json(venue);
}

// PUT /api/venues/[id] - Update a venue
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const data = await request.json();
  const venue = await Venue.findByIdAndUpdate(params.id, data, { new: true });
  if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
  return NextResponse.json(venue);
}

// PATCH /api/venues/[id] - Partial updates (e.g., images)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const data = await request.json();
  const venue = await Venue.findByIdAndUpdate(params.id, { $set: data }, { new: true });
  if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
  return NextResponse.json(venue);
}

// DELETE /api/venues/[id] - Delete a venue
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const venue = await Venue.findByIdAndDelete(params.id);
  if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
  return NextResponse.json({ message: 'Venue deleted' });
}
