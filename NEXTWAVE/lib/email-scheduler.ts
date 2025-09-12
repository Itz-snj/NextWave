import { emailService, type ReminderEmailData } from "./email"

// Mock booking data structure
interface Booking {
  id: string
  customerName: string
  customerEmail: string
  venueName: string
  venueLocation: string
  venueAddress: string
  venuePhone: string
  courtName: string
  sport: string
  date: string
  time: string
  duration: number
  totalAmount: number
  status: "confirmed" | "cancelled" | "completed"
}

export class EmailScheduler {
  private static instance: EmailScheduler
  private scheduledReminders: Map<string, NodeJS.Timeout> = new Map()

  private constructor() {}

  public static getInstance(): EmailScheduler {
    if (!EmailScheduler.instance) {
      EmailScheduler.instance = new EmailScheduler()
    }
    return EmailScheduler.instance
  }

  // Schedule reminder emails for a booking
  public scheduleBookingReminders(booking: Booking): void {
    if (booking.status !== "confirmed") {
      return
    }

    const bookingDateTime = new Date(`${booking.date}T${booking.time}`)
    const now = new Date()

    // Schedule 24-hour reminder
    const reminder24h = new Date(bookingDateTime.getTime() - 24 * 60 * 60 * 1000)
    if (reminder24h > now) {
      const timeout24h = setTimeout(() => {
        this.sendReminder(booking, "24h", "tomorrow")
      }, reminder24h.getTime() - now.getTime())

      this.scheduledReminders.set(`${booking.id}-24h`, timeout24h)
    }

    // Schedule 2-hour reminder
    const reminder2h = new Date(bookingDateTime.getTime() - 2 * 60 * 60 * 1000)
    if (reminder2h > now) {
      const timeout2h = setTimeout(() => {
        this.sendReminder(booking, "2h", "in 2 hours")
      }, reminder2h.getTime() - now.getTime())

      this.scheduledReminders.set(`${booking.id}-2h`, timeout2h)
    }

    // Schedule 30-minute reminder
    const reminder30m = new Date(bookingDateTime.getTime() - 30 * 60 * 1000)
    if (reminder30m > now) {
      const timeout30m = setTimeout(() => {
        this.sendReminder(booking, "30m", "in 30 minutes")
      }, reminder30m.getTime() - now.getTime())

      this.scheduledReminders.set(`${booking.id}-30m`, timeout30m)
    }

    console.log(`📅 Scheduled ${this.scheduledReminders.size} reminders for booking ${booking.id}`)
  }

  // Cancel all reminders for a booking
  public cancelBookingReminders(bookingId: string): void {
    const remindersToCancel = Array.from(this.scheduledReminders.keys()).filter((key) => key.startsWith(bookingId))

    remindersToCancel.forEach((key) => {
      const timeout = this.scheduledReminders.get(key)
      if (timeout) {
        clearTimeout(timeout)
        this.scheduledReminders.delete(key)
      }
    })

    console.log(`❌ Cancelled ${remindersToCancel.length} reminders for booking ${bookingId}`)
  }

  private async sendReminder(booking: Booking, type: string, reminderTime: string): Promise<void> {
    try {
      const canCancel = type === "24h" || type === "2h"

      const reminderData: ReminderEmailData = {
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
      }

      const success = await emailService.sendBookingReminder(reminderData)

      if (success) {
        console.log(`✅ Sent ${type} reminder for booking ${booking.id}`)
      } else {
        console.error(`❌ Failed to send ${type} reminder for booking ${booking.id}`)
      }

      // Clean up the scheduled reminder
      this.scheduledReminders.delete(`${booking.id}-${type}`)
    } catch (error) {
      console.error(`Error sending ${type} reminder for booking ${booking.id}:`, error)
    }
  }

  // Get scheduled reminders count (for monitoring)
  public getScheduledRemindersCount(): number {
    return this.scheduledReminders.size
  }

  // Clear all scheduled reminders (useful for cleanup)
  public clearAllReminders(): void {
    this.scheduledReminders.forEach((timeout) => clearTimeout(timeout))
    this.scheduledReminders.clear()
    console.log("🧹 Cleared all scheduled email reminders")
  }
}

// Export singleton instance
export const emailScheduler = EmailScheduler.getInstance()

// Auto-schedule reminders for existing bookings on app startup
export function initializeEmailScheduler() {
  // In a real app, you would fetch existing confirmed bookings from the database
  // and schedule reminders for them
  console.log("📧 Email scheduler initialized")

  // Example: Schedule reminders for mock bookings
  if (process.env.NODE_ENV === "development") {
    const mockBookings: Booking[] = [
      {
        id: "DEMO123",
        customerName: "Demo User",
        customerEmail: "demo@example.com",
        venueName: "Demo Sports Arena",
        venueLocation: "Demo Location",
        venueAddress: "123 Demo Street",
        venuePhone: "+1 (555) 123-4567",
        courtName: "Demo Court 1",
        sport: "Badminton",
        date: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString().split("T")[0], // Tomorrow
        time: "18:00",
        duration: 2,
        totalAmount: 50,
        status: "confirmed",
      },
    ]

    mockBookings.forEach((booking) => {
      emailScheduler.scheduleBookingReminders(booking)
    })
  }
}
