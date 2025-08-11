"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, Star, Users } from "lucide-react"
import Link from "next/link"
import { EmailTestPanel } from "@/components/email-test-panel"

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      // Redirect based on user role
      switch (user.role) {
        case "admin":
          router.push("/admin/dashboard")
          break
        case "owner":
          router.push("/owner/dashboard")
          break
        default:
          // Stay on home page for regular users
          break
      }
    }
  }, [user, router])

  const popularVenues = [
    {
      id: 1,
      name: "SportZone Arena",
      sports: ["Badminton", "Tennis"],
      price: 25,
      location: "Downtown",
      rating: 4.8,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      name: "Elite Courts",
      sports: ["Basketball", "Volleyball"],
      price: 30,
      location: "Midtown",
      rating: 4.6,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      name: "Green Turf",
      sports: ["Football", "Cricket"],
      price: 40,
      location: "Suburbs",
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-indigo-600">QuickCourt</h1>
              </div>
              <div className="flex space-x-4">
                <Link href="/auth/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Book Sports Facilities & Join Matches</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover and book local sports facilities, connect with other players, and enjoy your favorite sports with
              QuickCourt.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/auth/signup">
                <Button size="lg" className="px-8">
                  Get Started
                </Button>
              </Link>
              <Link href="/venues">
                <Button variant="outline" size="lg" className="px-8 bg-transparent">
                  Browse Venues
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center mb-12">Why Choose QuickCourt?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-indigo-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Find Nearby Venues</h4>
                <p className="text-gray-600">
                  Discover sports facilities in your area with detailed information and reviews.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-indigo-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Easy Booking</h4>
                <p className="text-gray-600">Book courts and time slots instantly with real-time availability.</p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-indigo-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Join Community</h4>
                <p className="text-gray-600">Connect with other players and join matches in your area.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-indigo-600">QuickCourt</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}!</span>
              <Link href="/profile">
                <Button variant="outline">Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Ready to Play?</h2>
          <p className="text-lg mb-4">Find and book your favorite sports facilities</p>
          <Link href="/venues">
            <Button variant="secondary" size="lg">
              Browse Venues
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link href="/venues">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <h3 className="font-semibold">Find Venues</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/bookings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <h3 className="font-semibold">My Bookings</h3>
              </CardContent>
            </Card>
          </Link>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <h3 className="font-semibold">Join Matches</h3>
            </CardContent>
          </Card>
          <Link href="/profile">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <h3 className="font-semibold">Profile</h3>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Popular Venues */}
        <section>
          <h3 className="text-2xl font-bold mb-6">Popular Venues</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {popularVenues.map((venue) => (
              <Card key={venue.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img
                    src={venue.image || "/placeholder.svg"}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{venue.name}</span>
                    <div className="flex items-center text-sm text-yellow-600">
                      <Star className="h-4 w-4 fill-current mr-1" />
                      {venue.rating}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {venue.location}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {venue.sports.map((sport) => (
                        <span key={sport} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                          {sport}
                        </span>
                      ))}
                    </div>
                    <div className="text-lg font-semibold text-indigo-600">From ${venue.price}/hour</div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/venues/${venue.id}`}>
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        {process.env.NODE_ENV === "development" && (
          <section className="mt-16">
            <h3 className="text-2xl font-bold mb-6">Email System Testing</h3>
            <div className="flex justify-center">
              <EmailTestPanel />
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
