"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Mail, Send, Clock, X } from "lucide-react"

export function EmailTestPanel() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailType, setEmailType] = useState("confirmation")
  const [testEmail, setTestEmail] = useState("test@example.com")
  const { toast } = useToast()

  const sendTestEmail = async (type: string) => {
    setIsLoading(true)
    try {
      let endpoint = ""
      let payload = {}

      switch (type) {
        case "confirmation":
          endpoint = "/api/bookings/confirm"
          payload = {
            customerName: "Test User",
            customerEmail: testEmail,
            venueName: "Test Sports Arena",
            venueLocation: "Test Location, City",
            venueAddress: "123 Test Street, Test City 12345",
            venuePhone: "+1 (555) 123-4567",
            courtName: "Test Court 1",
            sport: "Badminton",
            date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            time: "18:00",
            duration: 2,
            totalAmount: 50,
          }
          break
        case "cancellation":
          endpoint = "/api/bookings/cancel"
          payload = {
            bookingId: "TEST123",
            reason: "Test cancellation",
          }
          break
        case "reminder":
          endpoint = "/api/bookings/reminder"
          payload = {
            bookingId: "TEST123",
            reminderType: "24h",
          }
          break
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Test email sent! 📧",
          description: `${type} email sent successfully to ${testEmail}`,
        })
      } else {
        toast({
          title: "Failed to send email",
          description: result.message || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email System Test
        </CardTitle>
        <CardDescription>Test the email notification system with different email types</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="test-email">Test Email Address</Label>
          <Input
            id="test-email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email to test"
          />
        </div>

        <div>
          <Label htmlFor="email-type">Email Type</Label>
          <Select value={emailType} onValueChange={setEmailType}>
            <SelectTrigger>
              <SelectValue placeholder="Select email type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confirmation">Booking Confirmation</SelectItem>
              <SelectItem value="cancellation">Booking Cancellation</SelectItem>
              <SelectItem value="reminder">Booking Reminder</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button onClick={() => sendTestEmail("confirmation")} disabled={isLoading} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Send Confirmation Email
          </Button>

          <Button
            onClick={() => sendTestEmail("cancellation")}
            disabled={isLoading}
            variant="destructive"
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Send Cancellation Email
          </Button>

          <Button onClick={() => sendTestEmail("reminder")} disabled={isLoading} variant="outline" className="w-full">
            <Clock className="h-4 w-4 mr-2" />
            Send Reminder Email
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p>
            <strong>Note:</strong> In development mode, emails are logged to console instead of being sent.
          </p>
          <p>Configure SMTP settings in environment variables for production.</p>
        </div>
      </CardContent>
    </Card>
  )
}
