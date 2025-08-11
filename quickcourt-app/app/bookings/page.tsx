"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Clock, Calendar, X } from "lucide-react"
import Link from "next/link"

interface Booking {
  id: number
  venue: {
    name: string
    location: string
  }
  court: {
    name: string
    sport: string
  }
  date: string
  time: string
  duration: number
  totalPrice: number
  status: "confirmed" | "cancelled" | "completed"
  bookingDate: string
}

export default function MyBookingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Mock bookings data
    const mockBookings: Booking[] = [
      {
        id: 1,
        venue: {
          name: "SportZone Arena",
          location: "Downtown, City Center",
        },
        court: {
          name: "Badminton Court 1",
          sport: "Badminton",
        },
        date: "2024-01-15",
        time: "18:00",
        duration: 2,
        totalPrice: 50,
        status: "confirmed",
        bookingDate: "2024-01-10",
      },
      {
        id: 2,
        venue: {
          name: "Elite Courts",
          location: "Midtown Sports Complex",
        },
        court: {
          name: "Basketball Court 1",
          sport: "Basketball",
        },
        date: "2024-01-12",
        time: "16:00",
        duration: 1,
        totalPrice: 30,
        status: "completed",
        bookingDate: "2024-01-08",
      },
      {
        id: 3,
        venue: {
          name: "Tennis Academy",
          location: "Northside, Hill View",
        },
        court: {
          name: "Tennis Court 1",
          sport: "Tennis",
        },
        date: "2024-01-20",
        time: "10:00",
        duration: 1,
        totalPrice: 35,
        status: "confirmed",
        bookingDate: "2024-01-11",
      },
      {
        id: 4,
        venue: {
          name: "Green Turf",
          location: "Suburbs, Green Valley",
        },
        court: {
          name: "Football Field 1",
          sport: "Football",
        },
        date: "2024-01-08",
        time: "14:00",
        duration: 2,
        totalPrice: 80,
        status: "cancelled",
        bookingDate: "2024-01-05",
      },
    ]

    setBookings(mockBookings)
    setIsLoading(false)
  }, [user, router])

  const handleCancelBooking = async (bookingId: number) => {
    try {
      // Show confirmation dialog first
      const confirmed = window.confirm(
        "Are you sure you want to cancel this booking? A 10% cancellation fee may apply.",
      )
      if (!confirmed) return

      const response = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingId.toString(),
          reason: "User requested cancellation",
        }),
      })

      const result = await response.json()

      if (result.success) {
        setBookings((prev) =>
          prev.map((booking) => (booking.id === bookingId ? { ...booking, status: "cancelled" as const } : booking)),
        )

        toast({
          title: "Booking cancelled 📧",
          description: `Your booking has been cancelled successfully. ${result.emailSent ? "Cancellation email sent!" : ""} Refund: $${result.refundAmount}`,
        })
      } else {
        toast({
          title: "Cancellation failed",
          description: result.message || "Failed to cancel booking. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isUpcoming = (date: string, time: string) => {
    const bookingDateTime = new Date(`${date}T${time}`)
    return bookingDateTime > new Date()
  }

  const upcomingBookings = bookings.filter(
    (booking) => booking.status === "confirmed" && isUpcoming(booking.date, booking.time),
  )

  const pastBookings = bookings.filter(
    (booking) =>
      booking.status === "completed" ||
      booking.status === "cancelled" ||
      (booking.status === "confirmed" && !isUpcoming(booking.date, booking.time)),
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
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
            <Link href="/">
              <h1 className="text-2xl font-bold text-indigo-600 cursor-pointer">QuickCourt</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/venues">
                <Button variant="outline">Browse Venues</Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline">Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h2>
          <p className="text-gray-600">Manage your court reservations</p>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming bookings</h3>
                  <p className="text-gray-600 mb-6">You don't have any upcoming court reservations.</p>
                  <Link href="/venues">
                    <Button>Browse Venues</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{booking.venue.name}</CardTitle>
                          <CardDescription>
                            <div className="flex items-center mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {booking.venue.location}
                            </div>
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="font-semibold mr-2">Court:</span>
                            <span>{booking.court.name}</span>
                            <Badge variant="secondary" className="ml-2">
                              {booking.court.sport}
                            </Badge>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{new Date(booking.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>
                              {booking.time} ({booking.duration} hour{booking.duration > 1 ? "s" : ""})
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm text-gray-600">Total Paid</div>
                            <div className="text-2xl font-bold text-indigo-600">${booking.totalPrice}</div>
                          </div>
                          <div className="space-x-2">
                            <Button variant="destructive" size="sm" onClick={() => handleCancelBooking(booking.id)}>
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No past bookings</h3>
                  <p className="text-gray-600">Your booking history will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{booking.venue.name}</CardTitle>
                          <CardDescription>
                            <div className="flex items-center mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {booking.venue.location}
                            </div>
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="font-semibold mr-2">Court:</span>
                            <span>{booking.court.name}</span>
                            <Badge variant="secondary" className="ml-2">
                              {booking.court.sport}
                            </Badge>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{new Date(booking.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>
                              {booking.time} ({booking.duration} hour{booking.duration > 1 ? "s" : ""})
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm text-gray-600">Total Paid</div>
                            <div className="text-2xl font-bold text-indigo-600">${booking.totalPrice}</div>
                          </div>
                          {booking.status === "completed" && (
                            <Button variant="outline" size="sm">
                              Leave Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
