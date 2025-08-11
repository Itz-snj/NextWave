import { type NextRequest, NextResponse } from "next/server"
import { emailService, type BookingEmailData } from "@/lib/email"
import { dbConnect, Booking, TimeSlot } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const bookingData = await request.json()

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
    required.forEach(([val, name]) => { if (val === undefined || val === null || val === '') errors.push(String(name)) })
    if (errors.length) {
      return NextResponse.json({ error: `Missing required fields: ${errors.join(', ')}` }, { status: 400 })
    }

    const created = await Booking.create({
      user: bookingData.userId,
      venue: bookingData.venueId,
      court: bookingData.courtId || bookingData.court,
      date: bookingData.date,
      time: bookingData.time,
      duration: Number(bookingData.duration || 1),
      totalAmount: Number(bookingData.totalAmount),
      status: 'confirmed',
    })

    // Mark the timeslot unavailable if it exists
    await TimeSlot.findOneAndUpdate({ court: created.court, date: created.date, time: created.time }, { isAvailable: false })

    // Prepare email data
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const emailData: BookingEmailData = {
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      bookingId: String(created._id),
      venueName: bookingData.venueName,
      venueLocation: bookingData.venueLocation,
      venueAddress: bookingData.venueAddress || "Address not provided",
      venuePhone: bookingData.venuePhone || "+1 (555) 123-4567",
      courtName: bookingData.courtName,
      sport: bookingData.sport,
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

    // Send confirmation email (do not fail the request if email fails)
    let emailSent = false
    try {
      emailSent = await emailService.sendBookingConfirmation(emailData)
    } catch (e) {
      console.warn('Email sending failed', e)
    }

    if (!emailSent) {
      console.warn("Failed to send booking confirmation email")
    }

    return NextResponse.json({ success: true, booking: created, emailSent, message: "Booking confirmed successfully" })
  } catch (error: any) {
    console.error("Booking confirmation error:", error?.message || error)
    return NextResponse.json({ error: error?.message || "Failed to confirm booking" }, { status: 500 })
  }
}
