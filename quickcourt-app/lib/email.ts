import nodemailer from "nodemailer"
import handlebars from "handlebars"

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Email templates
const bookingConfirmationTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - QuickCourt</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .booking-card { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .booking-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .detail-item { padding: 10px; background: #f1f3f4; border-radius: 4px; }
    .detail-label { font-weight: bold; color: #5f6368; font-size: 12px; text-transform: uppercase; }
    .detail-value { font-size: 16px; margin-top: 5px; }
    .total-amount { background: #e8f5e8; border: 2px solid #4caf50; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; }
    .status-confirmed { color: #4caf50; font-weight: bold; }
    @media (max-width: 600px) {
      .booking-details { grid-template-columns: 1fr; }
      .container { padding: 10px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 QuickCourt</h1>
      <h2>Booking Confirmed!</h2>
    </div>
    
    <div class="content">
      <p>Hi {{customerName}},</p>
      <p>Great news! Your court booking has been confirmed. Here are your booking details:</p>
      
      <div class="booking-card">
        <h3>{{venueName}}</h3>
        <p><strong>📍 Location:</strong> {{venueLocation}}</p>
        
        <div class="booking-details">
          <div class="detail-item">
            <div class="detail-label">Court</div>
            <div class="detail-value">{{courtName}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Sport</div>
            <div class="detail-value">{{sport}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Date</div>
            <div class="detail-value">{{bookingDate}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Time</div>
            <div class="detail-value">{{bookingTime}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Duration</div>
            <div class="detail-value">{{duration}} hour(s)</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Status</div>
            <div class="detail-value status-confirmed">CONFIRMED</div>
          </div>
        </div>
        
        <div class="total-amount">
          <h3>Total Amount Paid: ${{ totalAmount }}</h3>
          <p>Booking ID: #{{bookingId}}</p>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{bookingUrl}}" class="button">View Booking Details</a>
        <a href="{{venueUrl}}" class="button" style="background: #28a745;">View Venue</a>
      </div>
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h4>📋 Important Information:</h4>
        <ul>
          <li>Please arrive 10 minutes before your scheduled time</li>
          <li>Bring a valid ID for verification</li>
          <li>Cancellations must be made at least 2 hours in advance</li>
          <li>Contact the venue directly for any equipment needs</li>
        </ul>
      </div>
      
      <p>If you have any questions or need to make changes to your booking, please don't hesitate to contact us.</p>
      <p>We look forward to seeing you on the court!</p>
      
      <p>Best regards,<br>The QuickCourt Team</p>
    </div>
    
    <div class="footer">
      <p>© 2024 QuickCourt. All rights reserved.</p>
      <p>
        <a href="{{unsubscribeUrl}}" style="color: #666;">Unsubscribe</a> | 
        <a href="mailto:support@quickcourt.com" style="color: #666;">Contact Support</a>
      </p>
    </div>
  </div>
</body>
</html>
`

const bookingCancellationTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Cancelled - QuickCourt</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .booking-card { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .booking-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .detail-item { padding: 10px; background: #f1f3f4; border-radius: 4px; }
    .detail-label { font-weight: bold; color: #5f6368; font-size: 12px; text-transform: uppercase; }
    .detail-value { font-size: 16px; margin-top: 5px; }
    .refund-info { background: #e3f2fd; border: 2px solid #2196f3; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; }
    .status-cancelled { color: #f44336; font-weight: bold; }
    @media (max-width: 600px) {
      .booking-details { grid-template-columns: 1fr; }
      .container { padding: 10px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 QuickCourt</h1>
      <h2>Booking Cancelled</h2>
    </div>
    
    <div class="content">
      <p>Hi {{customerName}},</p>
      <p>We've received your cancellation request. Your booking has been successfully cancelled.</p>
      
      <div class="booking-card">
        <h3>{{venueName}}</h3>
        <p><strong>📍 Location:</strong> {{venueLocation}}</p>
        
        <div class="booking-details">
          <div class="detail-item">
            <div class="detail-label">Court</div>
            <div class="detail-value">{{courtName}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Sport</div>
            <div class="detail-value">{{sport}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Date</div>
            <div class="detail-value">{{bookingDate}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Time</div>
            <div class="detail-value">{{bookingTime}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Duration</div>
            <div class="detail-value">{{duration}} hour(s)</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Status</div>
            <div class="detail-value status-cancelled">CANCELLED</div>
          </div>
        </div>
        
        <div class="refund-info">
          <h3>💰 Refund Information</h3>
          <p><strong>Refund Amount:</strong> ${{ refundAmount }}</p>
          <p>Your refund will be processed within 3-5 business days and will appear on your original payment method.</p>
          <p><strong>Cancellation ID:</strong> #{{cancellationId}}</p>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{venuesUrl}}" class="button">Book Another Court</a>
        <a href="{{bookingsUrl}}" class="button" style="background: #28a745;">View My Bookings</a>
      </div>
      
      <p>We're sorry to see you cancel your booking. If there was an issue with our service, please let us know so we can improve.</p>
      <p>We hope to see you back on the court soon!</p>
      
      <p>Best regards,<br>The QuickCourt Team</p>
    </div>
    
    <div class="footer">
      <p>© 2024 QuickCourt. All rights reserved.</p>
      <p>
        <a href="{{unsubscribeUrl}}" style="color: #666;">Unsubscribe</a> | 
        <a href="mailto:support@quickcourt.com" style="color: #666;">Contact Support</a>
      </p>
    </div>
  </div>
</body>
</html>
`

const bookingReminderTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Reminder - QuickCourt</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ffa726 0%, #ff7043 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .booking-card { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .booking-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .detail-item { padding: 10px; background: #f1f3f4; border-radius: 4px; }
    .detail-label { font-weight: bold; color: #5f6368; font-size: 12px; text-transform: uppercase; }
    .detail-value { font-size: 16px; margin-top: 5px; }
    .reminder-info { background: #fff3e0; border: 2px solid #ff9800; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; }
    .status-upcoming { color: #ff9800; font-weight: bold; }
    @media (max-width: 600px) {
      .booking-details { grid-template-columns: 1fr; }
      .container { padding: 10px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 QuickCourt</h1>
      <h2>⏰ Booking Reminder</h2>
    </div>
    
    <div class="content">
      <p>Hi {{customerName}},</p>
      <p>This is a friendly reminder about your upcoming court booking {{reminderTime}}!</p>
      
      <div class="booking-card">
        <h3>{{venueName}}</h3>
        <p><strong>📍 Location:</strong> {{venueLocation}}</p>
        
        <div class="booking-details">
          <div class="detail-item">
            <div class="detail-label">Court</div>
            <div class="detail-value">{{courtName}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Sport</div>
            <div class="detail-value">{{sport}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Date</div>
            <div class="detail-value">{{bookingDate}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Time</div>
            <div class="detail-value">{{bookingTime}}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Duration</div>
            <div class="detail-value">{{duration}} hour(s)</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Status</div>
            <div class="detail-value status-upcoming">UPCOMING</div>
          </div>
        </div>
        
        <div class="reminder-info">
          <h3>🎯 Get Ready to Play!</h3>
          <p>Your booking is coming up soon. Don't forget to:</p>
          <ul style="text-align: left; display: inline-block;">
            <li>Arrive 10 minutes early</li>
            <li>Bring your sports gear</li>
            <li>Carry a valid ID</li>
            <li>Check the weather (if outdoor)</li>
          </ul>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{bookingUrl}}" class="button">View Booking</a>
        <a href="{{venueUrl}}" class="button" style="background: #28a745;">Get Directions</a>
        {{#if canCancel}}
        <a href="{{cancelUrl}}" class="button" style="background: #dc3545;">Cancel Booking</a>
        {{/if}}
      </div>
      
      <div style="background: #e8f5e8; border: 1px solid #4caf50; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h4>📞 Venue Contact Information:</h4>
        <p><strong>Phone:</strong> {{venuePhone}}</p>
        <p><strong>Address:</strong> {{venueAddress}}</p>
      </div>
      
      <p>Have a great game and enjoy your time on the court!</p>
      
      <p>Best regards,<br>The QuickCourt Team</p>
    </div>
    
    <div class="footer">
      <p>© 2024 QuickCourt. All rights reserved.</p>
      <p>
        <a href="{{unsubscribeUrl}}" style="color: #666;">Unsubscribe</a> | 
        <a href="mailto:support@quickcourt.com" style="color: #666;">Contact Support</a>
      </p>
    </div>
  </div>
</body>
</html>
`

// Email service interface
export interface BookingEmailData {
  customerName: string
  customerEmail: string
  bookingId: string
  venueName: string
  venueLocation: string
  venueAddress?: string
  venuePhone?: string
  courtName: string
  sport: string
  bookingDate: string
  bookingTime: string
  duration: number
  totalAmount: number
  bookingUrl?: string
  venueUrl?: string
  venuesUrl?: string
  bookingsUrl?: string
  cancelUrl?: string
  unsubscribeUrl?: string
}

export interface CancellationEmailData extends BookingEmailData {
  refundAmount: number
  cancellationId: string
}

export interface ReminderEmailData extends BookingEmailData {
  reminderTime: string
  canCancel: boolean
}

// Email service class
export class EmailService {
  private static instance: EmailService

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  private compileTemplate(template: string, data: any): string {
    const compiledTemplate = handlebars.compile(template)
    return compiledTemplate(data)
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      // In development, log email instead of sending
      if (process.env.NODE_ENV === "development") {
        console.log("📧 EMAIL WOULD BE SENT:")
        console.log("To:", to)
        console.log("Subject:", subject)
        console.log("HTML Preview:", html.substring(0, 200) + "...")
        return true
      }

      const mailOptions = {
        from: `"QuickCourt" <${process.env.SMTP_FROM || "noreply@quickcourt.com"}>`,
        to,
        subject,
        html,
      }

      const result = await transporter.sendMail(mailOptions)
      console.log("Email sent successfully:", result.messageId)
      return true
    } catch (error) {
      console.error("Failed to send email:", error)
      return false
    }
  }

  public async sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
    const emailData = {
      ...data,
      bookingUrl: data.bookingUrl || `${process.env.NEXT_PUBLIC_APP_URL}/bookings`,
      venueUrl: data.venueUrl || `${process.env.NEXT_PUBLIC_APP_URL}/venues`,
      unsubscribeUrl: data.unsubscribeUrl || `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe`,
    }

    const html = this.compileTemplate(bookingConfirmationTemplate, emailData)
    const subject = `🎾 Booking Confirmed - ${data.venueName} | QuickCourt`

    return this.sendEmail(data.customerEmail, subject, html)
  }

  public async sendBookingCancellation(data: CancellationEmailData): Promise<boolean> {
    const emailData = {
      ...data,
      venuesUrl: data.venuesUrl || `${process.env.NEXT_PUBLIC_APP_URL}/venues`,
      bookingsUrl: data.bookingsUrl || `${process.env.NEXT_PUBLIC_APP_URL}/bookings`,
      unsubscribeUrl: data.unsubscribeUrl || `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe`,
    }

    const html = this.compileTemplate(bookingCancellationTemplate, emailData)
    const subject = `❌ Booking Cancelled - ${data.venueName} | QuickCourt`

    return this.sendEmail(data.customerEmail, subject, html)
  }

  public async sendBookingReminder(data: ReminderEmailData): Promise<boolean> {
    const emailData = {
      ...data,
      bookingUrl: data.bookingUrl || `${process.env.NEXT_PUBLIC_APP_URL}/bookings`,
      venueUrl: data.venueUrl || `${process.env.NEXT_PUBLIC_APP_URL}/venues`,
      cancelUrl: data.cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/bookings`,
      unsubscribeUrl: data.unsubscribeUrl || `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe`,
    }

    const html = this.compileTemplate(bookingReminderTemplate, emailData)
    const subject = `⏰ Reminder: Your booking ${data.reminderTime} | QuickCourt`

    return this.sendEmail(data.customerEmail, subject, html)
  }

  // Utility method to send welcome email for new users
  public async sendWelcomeEmail(customerName: string, customerEmail: string, role: string): Promise<boolean> {
    const welcomeTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1>🏆 Welcome to QuickCourt!</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <p>Hi ${customerName},</p>
          <p>Welcome to QuickCourt! We're excited to have you join our sports community.</p>
          <p>As a ${role}, you can now:</p>
          ${
            role === "user"
              ? `
            <ul>
              <li>🏟️ Browse and book sports facilities</li>
              <li>📅 Manage your bookings</li>
              <li>⭐ Rate and review venues</li>
              <li>🤝 Connect with other players</li>
            </ul>
          `
              : role === "owner"
                ? `
            <ul>
              <li>🏢 Manage your sports facilities</li>
              <li>📊 Track bookings and revenue</li>
              <li>⚙️ Configure courts and pricing</li>
              <li>📈 Access detailed analytics</li>
            </ul>
          `
                : ""
          }
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Get Started
            </a>
          </div>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The QuickCourt Team</p>
        </div>
      </div>
    `

    const subject = `🎾 Welcome to QuickCourt, ${customerName}!`
    return this.sendEmail(customerEmail, subject, welcomeTemplate)
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance()
