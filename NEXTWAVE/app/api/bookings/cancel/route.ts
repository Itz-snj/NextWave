import { type NextRequest, NextResponse } from "next/server"
import { emailService, type CancellationEmailData } from "@/lib/email"
import { dbConnect, Booking, TimeSlot } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const { bookingId, reason } = await request.json()

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'cancelled' },
      { new: true }
    )
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    // Free the slot again
    await TimeSlot.findOneAndUpdate({ court: booking.court, date: booking.date, time: booking.time }, { isAvailable: true })

    // Simple refund logic: 90% refund
    const refundAmount = Number(booking.totalAmount || 0) * 0.9

    // Prepare email data
    const emailData: CancellationEmailData = {
      customerName: booking.customerName || 'Customer',
      customerEmail: booking.customerEmail || 'unknown@example.com',
      bookingId: String(booking._id),
      venueName: booking.venueName || 'Venue',
      venueLocation: booking.venueLocation || '',
      courtName: booking.courtName || 'Court',
      sport: booking.sport || '',
      bookingDate: new Date(booking.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      bookingTime: booking.time,
      duration: booking.duration,
      totalAmount: booking.totalAmount,
      refundAmount,
      cancellationId: `CN${Date.now()}`,
      venuesUrl: `${process.env.NEXT_PUBLIC_APP_URL}/venues`,
      bookingsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/bookings`,
    }

    // Send cancellation email
    const emailSent = await emailService.sendBookingCancellation(emailData)

    if (!emailSent) {
      console.warn("Failed to send booking cancellation email")
    }

    return NextResponse.json({
      success: true,
      booking,
      refundAmount,
      emailSent,
      message: "Booking cancelled successfully",
    })
  } catch (error) {
    console.error("Booking cancellation error:", error)
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 })
  }
}
