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

interface Venue {
  _id: string
  name: string
  location: string
  description?: string
}

interface Court {
  _id: string
  name: string
  sport: string
  basePricePerHour: number
}

interface BookingData {
  venue: Venue | null
  court: Court | null
  selectedDate: Date | null
  startTimeSlot: TimeSlot | null
  endTimeSlot: TimeSlot | null
  selectedSlots: TimeSlot[]
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
    venue: null,
    court: null,
    selectedDate: null,
    startTimeSlot: null,
    endTimeSlot: null,
    selectedSlots: [],
    duration: 1,
    totalPrice: 0,
  })

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)

  // Helper function to convert time string to minutes for easier calculation
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Helper function to convert minutes back to time string
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  // Helper function to get consecutive slots between start and end time
  const getConsecutiveSlots = (startTime: string, endTime: string): TimeSlot[] => {
    const startMinutes = timeToMinutes(startTime)
    const endMinutes = timeToMinutes(endTime)
    const consecutiveSlots: TimeSlot[] = []
    
    for (let time = startMinutes; time < endMinutes; time += 60) {
      const timeStr = minutesToTime(time)
      const slot = availableSlots.find(s => s.time === timeStr)
      if (slot) {
        consecutiveSlots.push(slot)
      } else {
        // If any slot is missing, return empty array to indicate booking not possible
        return []
      }
    }
    
    return consecutiveSlots
  }

  // Helper function to check if all consecutive slots are available
  const areConsecutiveSlotsAvailable = (slots: TimeSlot[]): boolean => {
    return slots.length > 0 && slots.every(slot => slot.isAvailable)
  }

  // Helper function to calculate total price for selected slots
  const calculateTotalPrice = (slots: TimeSlot[]): number => {
    return slots.reduce((total, slot) => total + slot.price, 0)
  }

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const loadVenueAndCourtData = async () => {
      try {
        const venueId = String(params.venueId)
        const courtId = String(params.courtId)
        
        console.log("🔍 Loading venue and court data...")
        console.log("🔍 Venue ID:", venueId)
        console.log("🔍 Court ID:", courtId)

        // Fetch venue details
        console.log("📡 Fetching venue details...")
        const venueResponse = await fetch(`/api/venues/${venueId}`)
        console.log("📡 Venue response status:", venueResponse.status)
        
        if (!venueResponse.ok) {
          const errorText = await venueResponse.text()
          console.error("❌ Venue fetch failed:", errorText)
          throw new Error(`Venue not found: ${venueResponse.status} ${errorText}`)
        }
        const venueData = await venueResponse.json()
        console.log("✅ Venue data loaded:", venueData)

        // Fetch court details
        console.log("📡 Fetching court details...")
        const courtResponse = await fetch(`/api/courts/${courtId}`)
        console.log("📡 Court response status:", courtResponse.status)
        
        if (!courtResponse.ok) {
          const errorText = await courtResponse.text()
          console.error("❌ Court fetch failed:", errorText)
          throw new Error(`Court not found: ${courtResponse.status} ${errorText}`)
        }
        const courtData = await courtResponse.json()
        console.log("✅ Court data loaded:", courtData)

        setBookingData((prev) => ({
          ...prev,
          venue: venueData,
          court: courtData,
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
      } catch (error) {
        console.error('❌ Error loading venue/court data:', error)
        toast({ 
          title: "Error", 
          description: `Failed to load venue or court details: ${error instanceof Error ? error.message : 'Unknown error'}`, 
          variant: "destructive" 
        })
        router.push('/venues')
      } finally {
        setIsLoading(false)
      }
    }

    loadVenueAndCourtData()
  }, [params, user, router, search, toast])

  useEffect(() => {
    const loadSlots = async () => {
      if (!bookingData.selectedDate || !bookingData.venue || !bookingData.court) return setAvailableSlots([])
      
      try {
        const date = bookingData.selectedDate.toISOString().slice(0, 10)
        console.log('🔍 USER BOOKING: Loading slots for:', { 
          venue: bookingData.venue._id, 
          court: bookingData.court._id, 
          date 
        })
        
        // Hide past slots and clean up passed ones
        const res = await fetch(`/api/timeslots?venue=${bookingData.venue._id}&court=${bookingData.court._id}&date=${date}&cleanup=1`)
        console.log('🔍 USER BOOKING: API response status:', res.status)
        
        if (!res.ok) {
          throw new Error('Failed to load time slots')
        }
        const data = await res.json()
        console.log('🔍 USER BOOKING: Raw API data:', data)
        console.log('🔍 USER BOOKING: Data type:', typeof data, 'Is array:', Array.isArray(data))
        
        const slots = (data || []).map((s: any) => ({ 
          _id: s._id,
          time: s.time, 
          price: s.price, 
          isAvailable: s.isAvailable 
        }))
        console.log('🔍 USER BOOKING: Processed slots:', slots)
        setAvailableSlots(slots)
        
        const qTime = search.get('time')
        if (qTime) {
          const match = slots.find((s: TimeSlot) => s.time === qTime && s.isAvailable)
          if (match) setBookingData((prev) => ({ ...prev, startTimeSlot: match, selectedSlots: [match] }))
        }
      } catch (error) {
        console.error('Error loading time slots:', error)
        toast({ 
          title: "Error", 
          description: "Failed to load available time slots.", 
          variant: "destructive" 
        })
      }
    }
    loadSlots()
  }, [bookingData.selectedDate, bookingData.venue, bookingData.court, search, toast])

  useEffect(() => {
    if (bookingData.selectedSlots.length > 0) {
      const totalPrice = calculateTotalPrice(bookingData.selectedSlots)
      setBookingData((prev) => ({ ...prev, totalPrice }))
    }
  }, [bookingData.selectedSlots])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setBookingData((prev) => ({
        ...prev,
        selectedDate: date,
        startTimeSlot: null,
        endTimeSlot: null,
        selectedSlots: [],
      }))
    }
  }

  const handleTimeSlotSelect = (slot: TimeSlot, isEndTime: boolean = false) => {
    if (!slot.isAvailable) return

    if (!isEndTime) {
      // Selecting start time
      setBookingData((prev) => ({
        ...prev,
        startTimeSlot: slot,
        endTimeSlot: null,
        selectedSlots: [slot],
        duration: 1,
      }))
    } else {
      // Selecting end time
      if (!bookingData.startTimeSlot) return

      const startTime = bookingData.startTimeSlot.time
      const endTime = slot.time
      
      // Validate that end time is after start time
      if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
        toast({
          title: "Invalid Selection",
          description: "End time must be after start time",
          variant: "destructive"
        })
        return
      }

      const consecutiveSlots = getConsecutiveSlots(startTime, endTime)
      
      if (consecutiveSlots.length === 0) {
        toast({
          title: "Booking Not Available",
          description: "Some time slots in this range are missing or unavailable. The turf will remain closed during those hours.",
          variant: "destructive"
        })
        return
      }

      if (!areConsecutiveSlotsAvailable(consecutiveSlots)) {
        toast({
          title: "Slots Not Available",
          description: "Some slots in your selected time range are already booked.",
          variant: "destructive"
        })
        return
      }

      const duration = Math.floor((timeToMinutes(endTime) - timeToMinutes(startTime)) / 60)
      
      setBookingData((prev) => ({
        ...prev,
        endTimeSlot: slot,
        selectedSlots: consecutiveSlots,
        duration: duration,
      }))
    }
  }

  const handleBooking = async () => {
    if (!bookingData.selectedDate || bookingData.selectedSlots.length === 0 || !bookingData.venue || !bookingData.court) {
      toast({ title: "Incomplete booking", description: "Please select a date and time slots", variant: "destructive" })
      return
    }

    setIsBooking(true)

    try {
      const ownerOrUserId = user?.id
      console.log("🔍 User ID for booking:", ownerOrUserId)
      console.log("🔍 User object:", user)
      
      if (!ownerOrUserId) {
        toast({ 
          title: "Authentication Error", 
          description: "Please log in to make a booking.", 
          variant: "destructive" 
        })
        router.push("/auth/login")
        return
      }

      // Create booking payload for multiple slots
      const startTime = bookingData.selectedSlots[0].time
      const endTime = bookingData.endTimeSlot?.time || minutesToTime(timeToMinutes(startTime) + 60)
      
      const bookingPayload = {
        userId: ownerOrUserId,
        customerName: user?.name || "Guest User",
        customerEmail: user?.email || "guest@example.com",
        venueId: bookingData.venue._id,
        venueName: bookingData.venue.name,
        venueLocation: bookingData.venue.location,
        courtId: bookingData.court._id,
        courtName: bookingData.court.name,
        sport: bookingData.court.sport,
        date: bookingData.selectedDate.toISOString().split("T")[0],
        startTime: startTime,
        endTime: endTime,
        selectedSlots: bookingData.selectedSlots.map(slot => ({
          time: slot.time,
          price: slot.price,
          _id: slot._id
        })),
        duration: bookingData.duration,
        totalAmount: bookingData.totalPrice,
      }

      console.log("📦 Sending booking payload:", JSON.stringify(bookingPayload, null, 2))

      const response = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

      const result = await response.json()
      console.log("📦 Response data:", JSON.stringify(result, null, 2))

      if (result.success) {
        toast({ 
          title: "🎉 Booking Successful!", 
          description: `Your booking has been confirmed! Booking ID: ${result.bookingId}. Confirmation email sent to ${user?.email}`, 
          variant: "default" 
        })
        
        // Add a small delay before redirecting to show the success message
        setTimeout(() => {
          router.push("/bookings")
        }, 2000)
      } else {
        console.error("❌ Booking failed with error:", result.error || result.message)
        
        // Handle specific error cases
        if (result.error?.includes("no longer available")) {
          toast({ 
            title: "Slot Unavailable", 
            description: "This time slot has been booked by someone else. Please select another time.", 
            variant: "destructive" 
          })
          // Refresh available slots
          const date = bookingData.selectedDate.toISOString().slice(0, 10)
          const res = await fetch(`/api/timeslots?venue=${bookingData.venue._id}&court=${bookingData.court._id}&date=${date}&cleanup=1`)
          if (res.ok) {
            const data = await res.json()
            const slots = (data || []).map((s: any) => ({ 
              _id: s._id,
              time: s.time, 
              price: s.price, 
              isAvailable: s.isAvailable 
            }))
            setAvailableSlots(slots)
            setBookingData((prev) => ({ ...prev, startTimeSlot: null, endTimeSlot: null, selectedSlots: [] }))
          }
        } else {
          toast({ 
            title: "Booking failed", 
            description: result.message || result.error || "Please try again.", 
            variant: "destructive" 
          })
        }
      }
    } catch (error) {
      console.error('❌ Booking error:', error)
      toast({ 
        title: "Booking failed", 
        description: "Network error. Please check your connection and try again.", 
        variant: "destructive" 
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

  if (!bookingData.venue || !bookingData.court) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Venue or Court Not Found</h2>
          <p className="text-gray-600 mb-4">The venue or court you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/venues')}>
            Browse Venues
          </Button>
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
                <h1 className="text-2xl font-bold text-indigo-600 cursor-pointer">NextWave</h1>
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
                    {bookingData.venue.description && (
                      <p className="text-gray-600 mt-2">{bookingData.venue.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{bookingData.court.name}</h4>
                      <Badge variant="secondary">{bookingData.court.sport}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600">
                        ₹{bookingData.selectedSlots.length > 0 ? bookingData.selectedSlots[0].price : bookingData.court.basePricePerHour}/hour
                      </div>
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
                  <CardTitle>Select Time Range</CardTitle>
                  <CardDescription>Choose start and end time for {bookingData.selectedDate.toDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Start Time Selection */}
                  <div>
                    <h4 className="font-semibold mb-2">Start Time</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {availableSlots.map((slot) => (
                        <Button
                          key={`start-${slot.time}`}
                          variant={
                            bookingData.startTimeSlot?.time === slot.time
                              ? "default"
                              : slot.isAvailable
                                ? "outline"
                                : "secondary"
                          }
                          disabled={!slot.isAvailable}
                          onClick={() => handleTimeSlotSelect(slot, false)}
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
                  </div>

                  {/* End Time Selection */}
                  {bookingData.startTimeSlot && (
                    <div>
                      <h4 className="font-semibold mb-2">End Time</h4>
                      <div className="grid grid-cols-4 gap-3">
                        {availableSlots
                          .filter(slot => timeToMinutes(slot.time) > timeToMinutes(bookingData.startTimeSlot!.time))
                          .map((slot) => (
                            <Button
                              key={`end-${slot.time}`}
                              variant={
                                bookingData.endTimeSlot?.time === slot.time
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => handleTimeSlotSelect(slot, true)}
                              className="h-12"
                            >
                              <div className="text-center">
                                <div className="font-semibold">{slot.time}</div>
                                <div className="text-xs">End</div>
                              </div>
                            </Button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Range Display */}
                  {bookingData.selectedSlots.length > 0 && (
                    <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                      <h4 className="font-semibold text-indigo-800 mb-2">Selected Time Slots:</h4>
                      <div className="flex flex-wrap gap-2">
                        {bookingData.selectedSlots.map((slot, index) => (
                          <Badge key={index} variant="default" className="bg-indigo-600">
                            {slot.time} - ₹{slot.price}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-2 text-sm text-indigo-700">
                        Total Duration: {bookingData.duration} hour{bookingData.duration > 1 ? 's' : ''}
                        <br />
                        Total Price: ₹{bookingData.totalPrice}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* No duration selection needed - calculated automatically from time range */}
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
                  {bookingData.selectedSlots.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Range:</span>
                      <span className="font-semibold">
                        {bookingData.selectedSlots[0].time} - {bookingData.endTimeSlot?.time || minutesToTime(timeToMinutes(bookingData.selectedSlots[0].time) + 60)}
                      </span>
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
                      disabled={isBooking || !bookingData.selectedDate || bookingData.selectedSlots.length === 0}
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
