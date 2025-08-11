import { type NextRequest, NextResponse } from "next/server"
import { emailService, type BookingEmailData } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json()

    // Mock booking confirmation logic
    const booking = {
      id: `BK${Date.now()}`,
      ...bookingData,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    }

    // Prepare email data
    const emailData: BookingEmailData = {
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      bookingId: booking.id,
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
      bookingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/bookings`,
      venueUrl: `${process.env.NEXT_PUBLIC_APP_URL}/venues/${bookingData.venueId}`,
    }

    // Send confirmation email
    const emailSent = await emailService.sendBookingConfirmation(emailData)

    if (!emailSent) {
      console.warn("Failed to send booking confirmation email")
    }

    return NextResponse.json({
      success: true,
      booking,
      emailSent,
      message: "Booking confirmed successfully",
    })
  } catch (error) {
    console.error("Booking confirmation error:", error)
    return NextResponse.json({ error: "Failed to confirm booking" }, { status: 500 })
  }
}
