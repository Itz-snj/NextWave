import { type NextRequest, NextResponse } from "next/server"
import { dbConnect, Booking, TimeSlot, User, Venue, Court } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Booking confirmation request received")
    
    await dbConnect()
    console.log("✅ Database connected successfully")
    
    const bookingData = await request.json()
    console.log("📦 Received booking data:", JSON.stringify(bookingData, null, 2))

    // Validate required fields up-front
    const errors: string[] = []
    const required = [
      [bookingData.userId, 'userId'],
      [bookingData.venueId, 'venueId'],
      [bookingData.courtId || bookingData.court, 'courtId'],
      [bookingData.date, 'date'],
      [bookingData.startTime || bookingData.time, 'startTime/time'],
      [bookingData.totalAmount, 'totalAmount'],
    ] as const
    required.forEach(([val, name]) => { 
      if (val === undefined || val === null || val === '') {
        errors.push(String(name))
        console.log(`❌ Missing required field: ${name} = ${val}`)
      } else {
        console.log(`✅ Field ${name} is present: ${val}`)
      }
    })
    
    if (errors.length) {
      console.log(`❌ Validation failed. Missing fields: ${errors.join(', ')}`)
      return NextResponse.json({ error: `Missing required fields: ${errors.join(', ')}` }, { status: 400 })
    }

    console.log("✅ All required fields validated")

    // Verify that user, venue, and court exist
    const [user, venue, court] = await Promise.all([
      User.findById(bookingData.userId),
      Venue.findById(bookingData.venueId),
      Court.findById(bookingData.courtId || bookingData.court)
    ])

    if (!user) {
      console.log("❌ User not found:", bookingData.userId)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!venue) {
      console.log("❌ Venue not found:", bookingData.venueId)
      return NextResponse.json({ error: "Venue not found" }, { status: 404 })
    }

    if (!court) {
      console.log("❌ Court not found:", bookingData.courtId || bookingData.court)
      return NextResponse.json({ error: "Court not found" }, { status: 404 })
    }

    console.log("✅ User, venue, and court verified")

    // Handle both single slot and multi-slot bookings
    const selectedSlots = bookingData.selectedSlots || []
    const startTime = bookingData.startTime || bookingData.time
    const endTime = bookingData.endTime
    
    if (selectedSlots.length > 0) {
      // Multi-slot booking - validate all selected slots are available
      console.log("🔍 Validating multi-slot booking...")
      
      for (const selectedSlot of selectedSlots) {
        const existingTimeslot = await TimeSlot.findOne({
          court: bookingData.courtId || bookingData.court,
          date: bookingData.date,
          time: selectedSlot.time,
          isAvailable: true
        })

        if (!existingTimeslot) {
          console.log("❌ Timeslot not available:", selectedSlot.time)
          return NextResponse.json({ 
            error: `Time slot ${selectedSlot.time} is no longer available` 
          }, { status: 409 })
        }
      }
      
      console.log("✅ All selected slots are available")
    } else {
      // Single slot booking (backward compatibility)
      const existingTimeslot = await TimeSlot.findOne({
        court: bookingData.courtId || bookingData.court,
        date: bookingData.date,
        time: startTime,
        isAvailable: true
      })

      if (!existingTimeslot) {
        console.log("❌ Timeslot not available:", startTime)
        return NextResponse.json({ error: "Selected time slot is no longer available" }, { status: 409 })
      }
      
      console.log("✅ Single timeslot availability confirmed")
    }

    const bookingPayload = {
      user: bookingData.userId,
      venue: bookingData.venueId,
      court: bookingData.courtId || bookingData.court,
      date: bookingData.date,
      startTime: startTime,
      endTime: endTime,
      selectedSlots: selectedSlots.map((slot: any) => ({
        time: slot.time,
        price: slot.price,
        _id: slot._id
      })),
      duration: Number(bookingData.duration || 1),
      totalAmount: Number(bookingData.totalAmount),
      status: 'confirmed',
      // Add additional booking details for better tracking
      customerName: bookingData.customerName || user.name,
      customerEmail: bookingData.customerEmail || user.email,
      venueName: bookingData.venueName || venue.name,
      venueLocation: bookingData.venueLocation || venue.location,
      courtName: bookingData.courtName || court.name,
      sport: bookingData.sport || court.sport,
    }
    
    console.log("📝 Creating booking with payload:", JSON.stringify(bookingPayload, null, 2))

    const created = await Booking.create(bookingPayload)
    console.log("✅ Booking created successfully:", created._id)

    // Mark all booked timeslots as unavailable
    if (selectedSlots.length > 0) {
      // Multi-slot booking
      for (const selectedSlot of selectedSlots) {
        const timeslotUpdate = await TimeSlot.findOneAndUpdate(
          { court: created.court, date: created.date, time: selectedSlot.time }, 
          { isAvailable: false }
        )
        console.log(`✅ Timeslot ${selectedSlot.time} updated:`, timeslotUpdate ? "found and updated" : "not found")
      }
    } else {
      // Single slot booking (backward compatibility)
      const timeslotUpdate = await TimeSlot.findOneAndUpdate(
        { court: created.court, date: created.date, time: startTime }, 
        { isAvailable: false }
      )
      console.log("✅ Timeslot updated:", timeslotUpdate ? "found and updated" : "not found")
    }

    // Email confirmation can be added later if needed
    console.log("🎉 Booking confirmation completed successfully")
    return NextResponse.json({ 
      success: true, 
      booking: created, 
      message: "Booking confirmed successfully",
      bookingId: String(created._id)
    })
  } catch (error: any) {
    console.error("❌ Booking confirmation error:", error?.message || error)
    console.error("❌ Full error object:", error)
    return NextResponse.json({ error: error?.message || "Failed to confirm booking" }, { status: 500 })
  }
}
