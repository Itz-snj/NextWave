import { type NextRequest, NextResponse } from "next/server"
import { emailService, type CancellationEmailData } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { bookingId, reason } = await request.json()

    // Mock booking cancellation logic
    const booking = {
      id: bookingId,
      customerName: "John Smith",
      customerEmail: "john@example.com",
      venueName: "SportZone Arena",
      venueLocation: "Downtown, City Center",
      courtName: "Badminton Court 1",
      sport: "Badminton",
      date: "2024-01-20",
      time: "18:00",
      duration: 2,
      totalAmount: 50,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason,
    }

    // Calculate refund (mock logic)
    const refundAmount = booking.totalAmount * 0.9 // 10% cancellation fee

    // Prepare email data
    const emailData: CancellationEmailData = {
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      bookingId: booking.id,
      venueName: booking.venueName,
      venueLocation: booking.venueLocation,
      courtName: booking.courtName,
      sport: booking.sport,
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
