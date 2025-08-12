import { type NextRequest, NextResponse } from "next/server"
import { emailService, type BookingEmailData } from "@/lib/email"
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
      [bookingData.time, 'time'],
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

    // Check if the timeslot is still available
    const existingTimeslot = await TimeSlot.findOne({
      court: bookingData.courtId || bookingData.court,
      date: bookingData.date,
      time: bookingData.time,
      isAvailable: true
    })

    if (!existingTimeslot) {
      console.log("❌ Timeslot not available:", bookingData.date, bookingData.time)
      return NextResponse.json({ error: "Selected time slot is no longer available" }, { status: 409 })
    }

    console.log("✅ Timeslot availability confirmed")

    const bookingPayload = {
      user: bookingData.userId,
      venue: bookingData.venueId,
      court: bookingData.courtId || bookingData.court,
      date: bookingData.date,
      time: bookingData.time,
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

    // Mark the timeslot unavailable
    const timeslotUpdate = await TimeSlot.findOneAndUpdate(
      { court: created.court, date: created.date, time: created.time }, 
      { isAvailable: false }
    )
    console.log("✅ Timeslot updated:", timeslotUpdate ? "found and updated" : "not found")

    // Prepare email data
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const emailData: BookingEmailData = {
      customerName: bookingData.customerName || user.name,
      customerEmail: bookingData.customerEmail || user.email,
      bookingId: String(created._id),
      venueName: bookingData.venueName || venue.name,
      venueLocation: bookingData.venueLocation || venue.location,
      venueAddress: bookingData.venueAddress || "Address not provided",
      venuePhone: bookingData.venuePhone || "+1 (555) 123-4567",
      courtName: bookingData.courtName || court.name,
      sport: bookingData.sport || court.sport,
      bookingDate: new Date(bookingData.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      bookingTime: bookingData.time,
      duration: bookingData.duration,
      totalAmount: bookingData.totalAmount,
      bookingUrl: `${appUrl}/bookings`,
      venueUrl: `${appUrl}/venues/${bookingData.venueId}`,
    }

    console.log("📧 Preparing email data:", JSON.stringify(emailData, null, 2))

    // Send confirmation email (do not fail the request if email fails)
    let emailSent = false
    try {
      emailSent = await emailService.sendBookingConfirmation(emailData)
      console.log("📧 Email sending result:", emailSent)
    } catch (e) {
      console.warn('❌ Email sending failed', e)
    }

    if (!emailSent) {
      console.warn("⚠️ Failed to send booking confirmation email")
    }

    console.log("🎉 Booking confirmation completed successfully")
    return NextResponse.json({ 
      success: true, 
      booking: created, 
      emailSent, 
      message: "Booking confirmed successfully",
      bookingId: String(created._id)
    })
  } catch (error: any) {
    console.error("❌ Booking confirmation error:", error?.message || error)
    console.error("❌ Full error object:", error)
    return NextResponse.json({ error: error?.message || "Failed to confirm booking" }, { status: 500 })
  }
}
