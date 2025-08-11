"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Star, Clock, Users, Wifi, Car, Coffee, Dumbbell, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Court {
  id: number
  name: string
  sport: string
  pricePerHour: number
  description: string
}

interface Venue {
  id: number
  name: string
  description: string
  location: string
  address: string
  sports: string[]
  rating: number
  reviewCount: number
  images: string[]
  amenities: string[]
  about: string
  courts: Court[]
  operatingHours: {
    open: string
    close: string
  }
  contact: {
    phone: string
    email: string
  }
}

export default function VenueDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data - in real app, this would fetch from API
    const mockVenue: Venue = {
      id: Number.parseInt(params.id as string),
      name: "SportZone Arena",
      description: "Premium sports facility with modern amenities and professional courts",
      location: "Downtown, City Center",
      address: "123 Sports Street, Downtown, City 12345",
      sports: ["Badminton", "Tennis", "Squash"],
      rating: 4.8,
      reviewCount: 124,
      images: [
        "/placeholder.svg?height=400&width=600",
        "/placeholder.svg?height=400&width=600",
        "/placeholder.svg?height=400&width=600",
        "/placeholder.svg?height=400&width=600",
        "/placeholder.svg?height=400&width=600",
      ],
      amenities: [
        "Free Parking",
        "Changing Rooms",
        "Equipment Rental",
        "Cafeteria",
        "WiFi",
        "Air Conditioning",
        "Professional Lighting",
        "Sound System",
      ],
      about: `SportZone Arena is a state-of-the-art sports facility located in the heart of downtown. 
               We offer premium courts for badminton, tennis, and squash with professional-grade equipment 
               and amenities. Our facility is perfect for both casual players and serious athletes looking 
               for a top-notch sporting experience.
               
               Established in 2018, we have been serving the local sports community with dedication to 
               excellence. Our courts are maintained to international standards and our staff is trained 
               to provide the best possible experience for all our guests.`,
      courts: [
        {
          id: 1,
          name: "Badminton Court 1",
          sport: "Badminton",
          pricePerHour: 25,
          description: "Professional badminton court with wooden flooring",
        },
        {
          id: 2,
          name: "Badminton Court 2",
          sport: "Badminton",
          pricePerHour: 25,
          description: "Professional badminton court with wooden flooring",
        },
        {
          id: 3,
          name: "Tennis Court 1",
          sport: "Tennis",
          pricePerHour: 40,
          description: "Indoor tennis court with synthetic surface",
        },
        {
          id: 4,
          name: "Squash Court 1",
          sport: "Squash",
          pricePerHour: 30,
          description: "Glass-back squash court with air conditioning",
        },
      ],
      operatingHours: {
        open: "06:00",
        close: "23:00",
      },
      contact: {
        phone: "+1 (555) 123-4567",
        email: "info@sportzonearena.com",
      },
    }

    setVenue(mockVenue)
    setIsLoading(false)
  }, [params.id])

  const amenityIcons: { [key: string]: any } = {
    "Free Parking": Car,
    WiFi: Wifi,
    Cafeteria: Coffee,
    "Equipment Rental": Dumbbell,
    "Changing Rooms": Users,
    "Air Conditioning": Clock,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading venue details...</p>
        </div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Venue not found</h2>
          <p className="text-gray-600 mb-4">The venue you're looking for doesn't exist.</p>
          <Link href="/venues">
            <Button>Back to Venues</Button>
          </Link>
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
            <div className="flex items-center space-x-4">
              <Link href="/bookings">
                <Button variant="outline">My Bookings</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Venue Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{venue.name}</h1>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-5 w-5 mr-2" />
                {venue.location}
              </div>
              <div className="flex items-center">
                <div className="flex items-center text-yellow-600 mr-4">
                  <Star className="h-5 w-5 fill-current mr-1" />
                  <span className="font-semibold">{venue.rating}</span>
                  <span className="text-gray-500 ml-1">({venue.reviewCount} reviews)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {venue.sports.map((sport) => (
                    <Badge key={sport} variant="secondary">
                      {sport}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Operating Hours</div>
              <div className="flex items-center text-gray-900">
                <Clock className="h-4 w-4 mr-1" />
                {venue.operatingHours.open} - {venue.operatingHours.close}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="aspect-video rounded-lg overflow-hidden mb-4">
                <img
                  src={venue.images[selectedImageIndex] || "/placeholder.svg"}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-5 gap-2">
                {venue.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? "border-indigo-500" : "border-transparent"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${venue.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {venue.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      {venue.about.split("\n\n").map((paragraph, index) => (
                        <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                          {paragraph.trim()}
                        </p>
                      ))}
                    </div>
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-semibold mb-2">Contact Information</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <strong>Address:</strong> {venue.address}
                        </p>
                        <p>
                          <strong>Phone:</strong> {venue.contact.phone}
                        </p>
                        <p>
                          <strong>Email:</strong> {venue.contact.email}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="amenities" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Amenities & Facilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {venue.amenities.map((amenity) => {
                        const IconComponent = amenityIcons[amenity] || Clock
                        return (
                          <div key={amenity} className="flex items-center space-x-3">
                            <IconComponent className="h-5 w-5 text-indigo-600" />
                            <span>{amenity}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                    <CardDescription>
                      {venue.reviewCount} reviews with an average rating of {venue.rating}/5
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Mock reviews */}
                      <div className="border-b pb-4">
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400 mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-current" />
                            ))}
                          </div>
                          <span className="font-semibold">John D.</span>
                          <span className="text-gray-500 ml-2">2 days ago</span>
                        </div>
                        <p className="text-gray-700">
                          Excellent facility with top-notch courts. The badminton courts are well-maintained and the
                          staff is very helpful. Definitely coming back!
                        </p>
                      </div>
                      <div className="border-b pb-4">
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400 mr-2">
                            {[...Array(4)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-current" />
                            ))}
                            <Star className="h-4 w-4 text-gray-300" />
                          </div>
                          <span className="font-semibold">Sarah M.</span>
                          <span className="text-gray-500 ml-2">1 week ago</span>
                        </div>
                        <p className="text-gray-700">
                          Great courts and amenities. The only downside is that it can get quite busy during peak hours.
                          Book in advance!
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400 mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-current" />
                            ))}
                          </div>
                          <span className="font-semibold">Mike R.</span>
                          <span className="text-gray-500 ml-2">2 weeks ago</span>
                        </div>
                        <p className="text-gray-700">
                          Perfect for tennis! The courts are professional quality and the equipment rental service is
                          convenient. Highly recommended.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Available Courts</CardTitle>
                <CardDescription>Select a court to book your session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {venue.courts.map((court) => (
                    <div key={court.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{court.name}</h4>
                          <p className="text-sm text-gray-600">{court.description}</p>
                        </div>
                        <Badge variant="outline">{court.sport}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-indigo-600">${court.pricePerHour}/hour</span>
                        <Link href={`/booking/${venue.id}/${court.id}`}>
                          <Button size="sm">Book Now</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-2">Quick Info</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Operating Hours:</span>
                      <span>
                        {venue.operatingHours.open} - {venue.operatingHours.close}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Rating:</span>
                      <span className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        {venue.rating}/5
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Reviews:</span>
                      <span>{venue.reviewCount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
