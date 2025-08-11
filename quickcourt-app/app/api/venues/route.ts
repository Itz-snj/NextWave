import { dbConnect, Venue } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/venues - List all venues
export async function GET() {
  await dbConnect();
  const venues = await Venue.find();
  return NextResponse.json(venues);
}

// POST /api/venues - Create a new venue
export async function POST(request: NextRequest) {
  await dbConnect();
  const data = await request.json();
  const venue = await Venue.create(data);
  return NextResponse.json(venue, { status: 201 });
}
