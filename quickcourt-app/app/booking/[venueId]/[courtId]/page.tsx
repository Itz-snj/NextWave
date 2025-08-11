"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, MapPin, CreditCard } from "lucide-react"
import Link from "next/link"

interface TimeSlot {
  time: string
  available: boolean
  price: number
}

interface BookingData {
  venue: {
    id: number
    name: string
    location: string
  }
  court: {
    id: number
    name: string
    sport: string
    pricePerHour: number
  }
  selectedDate: Date | null
  selectedTimeSlot: TimeSlot | null
  duration: number
  totalPrice: number
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [bookingData, setBookingData] = useState<BookingData>({
    venue: { id: 0, name: "", location: "" },
    court: { id: 0, name: "", sport: "", pricePerHour: 0 },
    selectedDate: null,
    selectedTimeSlot: null,
    duration: 1,
    totalPrice: 0,
  })

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)

  // Mock time slots
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const startHour = 6
    const endHour = 23

    for (let hour = startHour; hour < endHour; hour++) {
      const time = `${hour.toString().padStart(2, "0")}:00`
      // Randomly make some slots unavailable for demo
      const available = Math.random() > 0.3
      slots.push({
        time,
        available,
        price: bookingData.court.pricePerHour,
      })
    }

    return slots
  }

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Mock data - in real app, this would fetch from API
    const mockBookingData: BookingData = {
      venue: {
        id: Number.parseInt(params.venueId as string),
        name: "SportZone Arena",
        location: "Downtown, City Center",
      },
      court: {
        id: Number.parseInt(params.courtId as string),
        name: "Badminton Court 1",
        sport: "Badminton",
        pricePerHour: 25,
      },
      selectedDate: null,
      selectedTimeSlot: null,
      duration: 1,
      totalPrice: 0,
    }

    setBookingData(mockBookingData)
    setIsLoading(false)
  }, [params, user, router])

  useEffect(() => {
    if (bookingData.selectedDate) {
      const slots = generateTimeSlots(bookingData.selectedDate)
      setAvailableSlots(slots)
    }
  }, [bookingData.selectedDate, bookingData.court.pricePerHour])

  useEffect(() => {
    if (bookingData.selectedTimeSlot && bookingData.duration) {
      const totalPrice = bookingData.selectedTimeSlot.price * bookingData.duration
      setBookingData((prev) => ({ ...prev, totalPrice }))
    }
  }, [bookingData.selectedTimeSlot, bookingData.duration])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setBookingData((prev) => ({
        ...prev,
        selectedDate: date,
        selectedTimeSlot: null,
      }))
    }
  }

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (slot.available) {
      setBookingData((prev) => ({
        ...prev,
        selectedTimeSlot: slot,
      }))
    }
  }

  const handleDurationChange = (duration: number) => {
    setBookingData((prev) => ({
      ...prev,
      duration,
    }))
  }

  const handleBooking = async () => {
    if (!bookingData.selectedDate || !bookingData.selectedTimeSlot) {
      toast({
        title: "Incomplete booking",
        description: "Please select a date and time slot",
        variant: "destructive",
      })
      return
    }

    setIsBooking(true)

    try {
      // Prepare booking data for API
      const bookingPayload = {
        customerName: user?.name || "Guest User",
        customerEmail: user?.email || "guest@example.com",
        venueId: bookingData.venue.id,
        venueName: bookingData.venue.name,
        venueLocation: bookingData.venue.location,
        venueAddress: "123 Sports Street, Downtown, City 12345",
        venuePhone: "+1 (555) 123-4567",
        courtId: bookingData.court.id,
        courtName: bookingData.court.name,
        sport: bookingData.court.sport,
        date: bookingData.selectedDate.toISOString().split("T")[0],
        time: bookingData.selectedTimeSlot.time,
        duration: bookingData.duration,
        totalAmount: bookingData.totalPrice,
      }

      // Call booking confirmation API
      const response = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Booking confirmed! 📧",
          description: `Your court has been booked successfully. ${result.emailSent ? "Confirmation email sent!" : "Check your email for confirmation."}`,
        })
        router.push("/bookings")
      } else {
        toast({
          title: "Booking failed",
          description: result.message || "There was an issue processing your booking. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Booking failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsBooking(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Link href="/">
                <h1 className="text-2xl font-bold text-indigo-600 cursor-pointer">QuickCourt</h1>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Court</h1>
          <p className="text-gray-600">Select your preferred date and time</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Venue & Court Info */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{bookingData.venue.name}</h3>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {bookingData.venue.location}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{bookingData.court.name}</h4>
                      <Badge variant="secondary">{bookingData.court.sport}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600">${bookingData.court.pricePerHour}/hour</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>Choose your preferred date</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={bookingData.selectedDate || undefined}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Time Slot Selection */}
            {bookingData.selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Time Slot</CardTitle>
                  <CardDescription>Available slots for {bookingData.selectedDate.toDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={
                          bookingData.selectedTimeSlot?.time === slot.time
                            ? "default"
                            : slot.available
                              ? "outline"
                              : "secondary"
                        }
                        disabled={!slot.available}
                        onClick={() => handleTimeSlotSelect(slot)}
                        className="h-12"
                      >
                        <div className="text-center">
                          <div className="font-semibold">{slot.time}</div>
                          {slot.available ? (
                            <div className="text-xs">${slot.price}</div>
                          ) : (
                            <div className="text-xs">Booked</div>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Duration Selection */}
            {bookingData.selectedTimeSlot && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Duration</CardTitle>
                  <CardDescription>How long would you like to play?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((hours) => (
                      <Button
                        key={hours}
                        variant={bookingData.duration === hours ? "default" : "outline"}
                        onClick={() => handleDurationChange(hours)}
                        className="h-12"
                      >
                        <div className="text-center">
                          <div className="font-semibold">
                            {hours} hour{hours > 1 ? "s" : ""}
                          </div>
                          <div className="text-xs">${bookingData.court.pricePerHour * hours}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Venue:</span>
                    <span className="font-semibold">{bookingData.venue.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Court:</span>
                    <span className="font-semibold">{bookingData.court.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sport:</span>
                    <Badge variant="secondary">{bookingData.court.sport}</Badge>
                  </div>
                  {bookingData.selectedDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold">{bookingData.selectedDate.toDateString()}</span>
                    </div>
                  )}
                  {bookingData.selectedTimeSlot && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-semibold">{bookingData.selectedTimeSlot.time}</span>
                    </div>
                  )}
                  {bookingData.duration > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold">
                        {bookingData.duration} hour{bookingData.duration > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {bookingData.totalPrice > 0 && (
                  <>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-2xl font-bold text-indigo-600">${bookingData.totalPrice}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleBooking}
                      disabled={isBooking || !bookingData.selectedDate || !bookingData.selectedTimeSlot}
                    >
                      {isBooking ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Book & Pay ${bookingData.totalPrice}
                        </>
                      )}
                    </Button>

                    <div className="text-xs text-gray-500 text-center">
                      <p>By booking, you agree to our terms and conditions.</p>
                      <p className="mt-1">Payment is processed securely.</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
