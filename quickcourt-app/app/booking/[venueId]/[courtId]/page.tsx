"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, MapPin, CreditCard } from "lucide-react"
import Link from "next/link"

interface TimeSlot {
  _id?: string
  time: string
  isAvailable: boolean
  price: number
}

interface BookingData {
  venue: {
    id: string
    name: string
    location: string
  }
  court: {
    id: string
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
  const search = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [bookingData, setBookingData] = useState<BookingData>({
    venue: { id: "", name: "", location: "" },
    court: { id: "", name: "", sport: "", pricePerHour: 0 },
    selectedDate: null,
    selectedTimeSlot: null,
    duration: 1,
    totalPrice: 0,
  })

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Load venue/court basic data placeholders (could be extended to fetch details)
    const venueId = String(params.venueId)
    const courtId = String(params.courtId)
    setBookingData((prev) => ({
      ...prev,
      venue: { id: venueId, name: "Selected Venue", location: "" },
      court: { id: courtId, name: "Selected Court", sport: "", pricePerHour: 0 },
    }))
    // Preselect date/time from query if provided
    const qDate = search.get('date')
    const qTime = search.get('time')
    if (qDate) {
      const parsed = new Date(qDate)
      if (!isNaN(parsed.getTime())) {
        setBookingData((prev) => ({ ...prev, selectedDate: parsed }))
      }
    }
    if (qTime) {
      // selected time will be matched once slots are loaded
      setTimeout(() => {
        setAvailableSlots((prev) => prev)
      }, 0)
    }
    setIsLoading(false)
  }, [params, user, router, search])

  useEffect(() => {
    const loadSlots = async () => {
      if (!bookingData.selectedDate) return setAvailableSlots([])
      const date = bookingData.selectedDate.toISOString().slice(0, 10)
      // Hide past slots and clean up passed ones
      const res = await fetch(`/api/timeslots?venue=${bookingData.venue.id}&court=${bookingData.court.id}&date=${date}&cleanup=1`)
      const data = await res.json()
      const slots = (data || []).map((s: any) => ({ time: s.time, price: s.price, isAvailable: s.isAvailable }))
      setAvailableSlots(slots)
      const qTime = search.get('time')
      if (qTime) {
        const match = slots.find((s) => s.time === qTime && s.isAvailable)
        if (match) setBookingData((prev) => ({ ...prev, selectedTimeSlot: match }))
      }
    }
    loadSlots()
  }, [bookingData.selectedDate, bookingData.venue.id, bookingData.court.id, search])

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
    if (slot.isAvailable) {
      setBookingData((prev) => ({
        ...prev,
        selectedTimeSlot: slot,
      }))
    }
  }

  const handleDurationChange = (duration: number) => {
    setBookingData((prev) => ({ ...prev, duration }))
  }

  const handleBooking = async () => {
    if (!bookingData.selectedDate || !bookingData.selectedTimeSlot) {
      toast({ title: "Incomplete booking", description: "Please select a date and time slot", variant: "destructive" })
      return
    }

    setIsBooking(true)

    try {
      const ownerOrUserId = (user as any)?.id || (user as any)?._id
      const bookingPayload = {
        userId: ownerOrUserId,
        customerName: user?.name || "Guest User",
        customerEmail: user?.email || "guest@example.com",
        venueId: bookingData.venue.id,
        venueName: bookingData.venue.name,
        venueLocation: bookingData.venue.location,
        courtId: bookingData.court.id,
        courtName: bookingData.court.name,
        sport: bookingData.court.sport,
        date: bookingData.selectedDate.toISOString().split("T")[0],
        time: bookingData.selectedTimeSlot.time,
        duration: bookingData.duration,
        totalAmount: bookingData.totalPrice,
      }

      const response = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      })

      const result = await response.json()

      if (result.success) {
        toast({ title: "Booking confirmed!", description: "Confirmation email sent!" })
        router.push("/bookings")
      } else {
        toast({ title: "Booking failed", description: result.message || "Please try again.", variant: "destructive" })
      }
    } catch (_e) {
      toast({ title: "Booking failed", description: "Something went wrong.", variant: "destructive" })
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
                      <div className="text-lg font-bold text-indigo-600">₹{bookingData.selectedTimeSlot?.price || bookingData.court.pricePerHour}/hour</div>
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
                            : slot.isAvailable
                              ? "outline"
                              : "secondary"
                        }
                        disabled={!slot.isAvailable}
                        onClick={() => handleTimeSlotSelect(slot)}
                        className="h-12"
                      >
                        <div className="text-center">
                          <div className="font-semibold">{slot.time}</div>
                          {slot.isAvailable ? (
                            <div className="text-xs">₹{slot.price}</div>
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
                          <div className="text-xs">₹{(bookingData.selectedTimeSlot?.price || 0) * hours}</div>
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
                        <span className="text-2xl font-bold text-indigo-600">₹{bookingData.totalPrice}</span>
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
                          Book & Pay ₹{bookingData.totalPrice}
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
