import { type NextRequest, NextResponse } from "next/server"
import { emailService, type ReminderEmailData } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { bookingId, reminderType } = await request.json()

    // Mock booking data
    const booking = {
      id: bookingId,
      customerName: "John Smith",
      customerEmail: "john@example.com",
      venueName: "SportZone Arena",
      venueLocation: "Downtown, City Center",
      venueAddress: "123 Sports Street, Downtown, City 12345",
      venuePhone: "+1 (555) 123-4567",
      courtName: "Badminton Court 1",
      sport: "Badminton",
      date: "2024-01-20",
      time: "18:00",
      duration: 2,
      totalAmount: 50,
    }

    // Determine reminder timing
    const reminderTimes = {
      "24h": "tomorrow",
      "2h": "in 2 hours",
      "30m": "in 30 minutes",
    }

    const reminderTime = reminderTimes[reminderType as keyof typeof reminderTimes] || "soon"
    const canCancel = reminderType === "24h" || reminderType === "2h"

    // Prepare email data
    const emailData: ReminderEmailData = {
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      bookingId: booking.id,
      venueName: booking.venueName,
      venueLocation: booking.venueLocation,
      venueAddress: booking.venueAddress,
      venuePhone: booking.venuePhone,
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
      reminderTime,
      canCancel,
      bookingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/bookings`,
      venueUrl: `${process.env.NEXT_PUBLIC_APP_URL}/venues/1`,
      cancelUrl: canCancel ? `${process.env.NEXT_PUBLIC_APP_URL}/bookings/cancel/${booking.id}` : undefined,
    }

    // Send reminder email
    const emailSent = await emailService.sendBookingReminder(emailData)

    if (!emailSent) {
      console.warn("Failed to send booking reminder email")
    }

    return NextResponse.json({
      success: true,
      emailSent,
      message: `Booking reminder sent successfully (${reminderTime})`,
    })
  } catch (error) {
    console.error("Booking reminder error:", error)
    return NextResponse.json({ error: "Failed to send booking reminder" }, { status: 500 })
  }
}
