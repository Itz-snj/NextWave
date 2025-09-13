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

    console.log('GET timeslots params:', { venue, court, date, cleanup })

    const query: any = {}
    if (venue) query.venue = venue
    if (court) query.court = court
    if (date) query.date = date

    console.log('Initial query:', query)

    // Hide past-time slots for requested date
    if (date) {
      const now = new Date()
      const todayStr = now.toISOString().slice(0, 10)
      
      if (date < todayStr) {
        // Past date - optionally cleanup and return empty
        if (cleanup) {
          await TimeSlot.deleteMany({ date: { $lt: todayStr } })
        }
        return NextResponse.json([])
      }
      
      if (date === todayStr) {
        // Today's date - filter past times
        const nowHours = now.getHours()
        const nowMinutes = now.getMinutes()
        const currentTimeMinutes = nowHours * 60 + nowMinutes
        
        // Get all slots for today first
        const allSlotsToday = await TimeSlot.find({ ...query }).sort({ time: 1 })
        console.log('All slots found for today:', allSlotsToday.length)
        
        // Filter client-side with proper time comparison
        const validSlots = allSlotsToday.filter(slot => {
          const [hours, minutes] = slot.time.split(':').map(Number)
          const slotTimeMinutes = hours * 60 + minutes
          const isValid = slotTimeMinutes >= currentTimeMinutes
          console.log(`Slot ${slot.time} (${slotTimeMinutes} min) vs current ${nowHours}:${nowMinutes} (${currentTimeMinutes} min): ${isValid ? 'VALID' : 'PAST'}`)
          return isValid
        })
        
        console.log('Valid slots after filtering:', validSlots.length)
        
        // Cleanup past slots if requested
        if (cleanup) {
          const pastSlots = allSlotsToday.filter(slot => {
            const [hours, minutes] = slot.time.split(':').map(Number)
            const slotTimeMinutes = hours * 60 + minutes
            return slotTimeMinutes < currentTimeMinutes
          })
          
          if (pastSlots.length > 0) {
            const pastSlotIds = pastSlots.map(slot => slot._id)
            await TimeSlot.deleteMany({ _id: { $in: pastSlotIds } })
          }
        }
        
        return NextResponse.json(validSlots)
      }
    }

    const slots = await TimeSlot.find(query).sort({ time: 1 })
    console.log('Final slots returned:', slots.length)
    return NextResponse.json(slots)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load timeslots' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const data = await req.json()
    
    console.log('Creating timeslot with data:', data)
    
    // Validate required fields
    if (!data.venue || !data.court || !data.date || !data.time) {
      return NextResponse.json({ error: 'Missing required fields: venue, court, date, time' }, { status: 400 })
    }
    
    // data: { venue, court, date, time, price, isAvailable }
    const created = await TimeSlot.create(data)
    console.log('Timeslot created successfully:', created)
    
    return NextResponse.json(created, { status: 201 })
  } catch (e: any) {
    console.error('Error creating timeslot:', e)
    const message = e?.code === 11000 ? 'Duplicate slot for this court/date/time' : (e?.message || 'Failed to create timeslot')
    return NextResponse.json({ error: message }, { status: 400 })
  }
}