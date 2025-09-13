"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, Star, Users, Trophy, Zap, Shield, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface VenueApi {
  _id: string
  name: string
  description?: string
  location: string
  sports?: string[]
  priceRange: { min: number; max: number }
  rating?: number
  reviewCount?: number
  image?: string
  images?: string[]
  amenities?: string[]
  status: "approved" | "pending"
}

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [popularVenues, setPopularVenues] = useState<VenueApi[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  const heroImages = [
    "/modern-sports-arena-with-multiple-courts-aerial-vi.jpg",
    "/sports-equipment-and-arena-background.jpg",
    "/football-field-aerial.png",
    "/basketball-court-indoor-lighting.jpg",
    "/tennis-courts-outdoor-sunset.jpg",
  ]

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

  // Fetch approved venues for popular venues section
  useEffect(() => {
    setLoading(true)
    fetch("/api/venues")
      .then((r) => r.json())
      .then((data: VenueApi[]) => {
        const approved = data.filter((v) => v.status === "approved").slice(0, 3)
        setPopularVenues(approved)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [heroImages.length])

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <div className="bg-emerald-600 p-2 rounded-lg">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">NextWave</h1>
              </div>
              <div className="flex space-x-3">
                <Link href="/auth/login">
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">Sign Up</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section with Auto-Slider */}
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0">
            {heroImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Sports facility ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm p-3 rounded-full transition-all text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroImages.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm p-3 rounded-full transition-all text-white"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="text-white max-w-2xl">
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-600/90 text-white">
                  <Zap className="h-4 w-4 mr-2" />
                  Book Premium Sports Venues
                </span>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Find Your Perfect <span className="text-emerald-400">Playing Field</span>
              </h2>

              <p className="text-xl mb-8 text-gray-200 leading-relaxed">
                Connect with top-rated sports facilities across India. From cricket grounds to basketball courts,
                discover venues that match your passion for the game.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/auth/signup">
                  <Button size="lg" className="px-8 py-3 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-lg">
                    <Trophy className="h-5 w-5 mr-2" />
                    Get Started
                  </Button>
                </Link>
                <Link href="/venues">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-3 text-lg border-2 border-white text-white hover:bg-white hover:text-gray-900 bg-transparent"
                  >
                    <MapPin className="h-5 w-5 mr-2" />
                    Browse Venues
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-emerald-400">500+</div>
                  <div className="text-sm text-gray-300">Venues</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">50K+</div>
                  <div className="text-sm text-gray-300">Players</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">25+</div>
                  <div className="text-sm text-gray-300">Sports</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-400">4.9★</div>
                  <div className="text-sm text-gray-300">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Players Choose NextWave</h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We make booking sports venues simple, reliable, and enjoyable
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-emerald-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-emerald-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-900">Quality Venues</h4>
                <p className="text-gray-600">
                  Hand-picked sports facilities with verified reviews and detailed information to help you choose.
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-900">Quick Booking</h4>
                <p className="text-gray-600">
                  Real-time availability and instant confirmations. Book your slot in just a few clicks.
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-900">Sports Community</h4>
                <p className="text-gray-600">
                  Connect with fellow players, join matches, and be part of an active sports community.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-orange-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-900">Safe & Secure</h4>
                <p className="text-gray-600">
                  All venues meet safety standards with secure payment processing and booking protection.
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-teal-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-teal-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-900">Flexible Timing</h4>
                <p className="text-gray-600">
                  Book for any duration, reschedule when needed, and manage everything from your dashboard.
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-pink-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-pink-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-900">Tournaments</h4>
                <p className="text-gray-600">
                  Join exciting tournaments, corporate events, and community matches organized regularly.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Sports We Cover</h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                From traditional favorites to trending sports, find the perfect venue for your game
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                {
                  name: "Cricket",
                  image: "/cricket-bat-and-ball-on-grass-field.jpg",
                  color: "bg-green-50 border-green-200",
                  textColor: "text-green-700",
                },
                {
                  name: "Football",
                  image: "/football-on-grass-field-with-goal-posts.jpg",
                  color: "bg-blue-50 border-blue-200",
                  textColor: "text-blue-700",
                },
                {
                  name: "Basketball",
                  image: "/basketball-court-with-hoop-and-ball.jpg",
                  color: "bg-orange-50 border-orange-200",
                  textColor: "text-orange-700",
                },
                {
                  name: "Tennis",
                  image: "/tennis-court-with-racket-and-ball.jpg",
                  color: "bg-yellow-50 border-yellow-200",
                  textColor: "text-yellow-700",
                },
                {
                  name: "Badminton",
                  image: "/badminton-court-with-racket-and-shuttlecock.jpg",
                  color: "bg-purple-50 border-purple-200",
                  textColor: "text-purple-700",
                },
                {
                  name: "Swimming",
                  image: "/swimming-pool-lanes-with-clear-blue-water.jpg",
                  color: "bg-cyan-50 border-cyan-200",
                  textColor: "text-cyan-700",
                },
              ].map((sport) => (
                <div key={sport.name} className="group cursor-pointer">
                  <div
                    className={`${sport.color} border-2 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105`}
                  >
                    <div className="aspect-square mb-3 overflow-hidden rounded-xl">
                      <img
                        src={sport.image || "/placeholder.svg"}
                        alt={sport.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h4 className={`font-semibold text-center ${sport.textColor}`}>{sport.name}</h4>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/venues">
                <Button className="bg-emerald-600 hover:bg-emerald-700 px-8 py-3">
                  <MapPin className="h-5 w-5 mr-2" />
                  Find Venues for Your Sport
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">NextWave</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Welcome back, {user.name}!</span>
              <Link href="/profile">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">
                  Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="relative bg-emerald-600 rounded-2xl p-8 text-white mb-8 overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-[url('/sports-equipment-and-arena-background.jpg')] bg-cover bg-center opacity-20"></div>
          <div className="relative">
            <h2 className="text-3xl font-bold mb-2">Ready to Play? 🏆</h2>
            <p className="text-xl mb-6 text-emerald-100">Find and book premium sports facilities near you</p>
            <Link href="/venues">
              <Button variant="secondary" size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 shadow-md">
                <MapPin className="h-5 w-5 mr-2" />
                Browse Venues
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Link href="/venues">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">Find Venues</h3>
                <p className="text-sm text-gray-600 mt-2">Discover amazing sports facilities</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/bookings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">My Bookings</h3>
                <p className="text-sm text-gray-600 mt-2">Manage your reservations</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-gray-200">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900">Join Matches</h3>
              <p className="text-sm text-gray-600 mt-2">Connect with other players</p>
            </CardContent>
          </Card>

          <Link href="/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Star className="h-7 w-7 text-orange-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">Profile</h3>
                <p className="text-sm text-gray-600 mt-2">View your sports journey</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Popular Venues */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">🔥 Popular Venues</h3>
              <p className="text-gray-600">Top-rated sports facilities in your area</p>
            </div>
            <Link href="/venues">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">
                View All Venues
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse shadow-sm">
                  <div className="aspect-video bg-gray-200 rounded-t-xl"></div>
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : popularVenues.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {popularVenues.map((venue) => (
                <Card key={venue._id} className="hover:shadow-lg transition-shadow bg-white overflow-hidden group">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={
                        (venue.images && venue.images[0]) ||
                        venue.image ||
                        "/placeholder.svg?height=300&width=400&query=modern sports facility interior"
                      }
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-start">
                      <span className="text-xl font-bold text-gray-900">{venue.name}</span>
                      <div className="flex items-center text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        <Star className="h-4 w-4 fill-current mr-1" />
                        {venue.rating ?? 4.5}
                      </div>
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                        {venue.location}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(venue.sports || []).slice(0, 3).map((sport) => (
                          <span
                            key={sport}
                            className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-medium"
                          >
                            {sport}
                          </span>
                        ))}
                      </div>
                      <div className="text-2xl font-bold text-emerald-600">₹{venue.priceRange?.min ?? 0}/hour</div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/venues/${venue._id}`}>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md">
                        <Trophy className="h-4 w-4 mr-2" />
                        Book Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-xl text-gray-600 mb-6">
                No venues available yet, but exciting options are coming soon!
              </p>
              <Link href="/venues">
                <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-md">
                  <Trophy className="h-4 w-4 mr-2" />
                  Explore All Venues
                </Button>
              </Link>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-emerald-600 p-2 rounded-lg">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">NextWave</h3>
              </div>
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                India's premier platform for booking world-class sports facilities and connecting with passionate sports
                enthusiasts.
              </p>
              <div className="flex space-x-4">
                <div className="bg-emerald-600 p-2 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="bg-blue-600 p-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="bg-purple-600 p-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                  <Users className="h-5 w-5" />
                </div>
                <div className="bg-orange-600 p-2 rounded-lg hover:bg-orange-700 transition-colors cursor-pointer">
                  <Trophy className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-emerald-400">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/venues"
                    className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center"
                  >
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                    Browse Venues
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bookings"
                    className="text-gray-300 hover:text-blue-400 transition-colors flex items-center"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    My Bookings
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="text-gray-300 hover:text-purple-400 transition-colors flex items-center"
                  >
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/login"
                    className="text-gray-300 hover:text-orange-400 transition-colors flex items-center"
                  >
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-blue-400">Support</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 NextWave Sports. All rights reserved.</p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
