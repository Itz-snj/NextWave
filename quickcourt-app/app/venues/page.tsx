"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Search, Filter } from "lucide-react"
import Link from "next/link"

interface Venue {
  id: number
  name: string
  description: string
  location: string
  sports: string[]
  priceRange: { min: number; max: number }
  rating: number
  reviewCount: number
  image: string
  amenities: string[]
  status: "approved" | "pending"
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sportFilter, setSportFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockVenues: Venue[] = [
      {
        id: 1,
        name: "SportZone Arena",
        description: "Premium sports facility with modern amenities",
        location: "Downtown, City Center",
        sports: ["Badminton", "Tennis", "Squash"],
        priceRange: { min: 25, max: 45 },
        rating: 4.8,
        reviewCount: 124,
        image: "/placeholder.svg?height=200&width=300",
        amenities: ["Parking", "Changing Rooms", "Equipment Rental", "Cafeteria"],
        status: "approved",
      },
      {
        id: 2,
        name: "Elite Courts",
        description: "Professional basketball and volleyball courts",
        location: "Midtown Sports Complex",
        sports: ["Basketball", "Volleyball"],
        priceRange: { min: 30, max: 50 },
        rating: 4.6,
        reviewCount: 89,
        image: "/placeholder.svg?height=200&width=300",
        amenities: ["Parking", "Changing Rooms", "Air Conditioning", "Sound System"],
        status: "approved",
      },
      {
        id: 3,
        name: "Green Turf",
        description: "Outdoor football and cricket grounds",
        location: "Suburbs, Green Valley",
        sports: ["Football", "Cricket"],
        priceRange: { min: 40, max: 80 },
        rating: 4.9,
        reviewCount: 156,
        image: "/placeholder.svg?height=200&width=300",
        amenities: ["Parking", "Floodlights", "Scoreboard", "Seating"],
        status: "approved",
      },
      {
        id: 4,
        name: "AquaFit Center",
        description: "Swimming pool and water sports facility",
        location: "Westside, Marina District",
        sports: ["Swimming", "Water Polo"],
        priceRange: { min: 20, max: 35 },
        rating: 4.5,
        reviewCount: 67,
        image: "/placeholder.svg?height=200&width=300",
        amenities: ["Parking", "Changing Rooms", "Lockers", "Pool Equipment"],
        status: "approved",
      },
      {
        id: 5,
        name: "Fitness Hub",
        description: "Multi-sport indoor facility",
        location: "Eastside, Business District",
        sports: ["Table Tennis", "Badminton", "Gym"],
        priceRange: { min: 15, max: 30 },
        rating: 4.3,
        reviewCount: 92,
        image: "/placeholder.svg?height=200&width=300",
        amenities: ["Parking", "Equipment Rental", "Trainer Available", "Juice Bar"],
        status: "approved",
      },
      {
        id: 6,
        name: "Tennis Academy",
        description: "Professional tennis courts with coaching",
        location: "Northside, Hill View",
        sports: ["Tennis"],
        priceRange: { min: 35, max: 60 },
        rating: 4.7,
        reviewCount: 78,
        image: "/placeholder.svg?height=200&width=300",
        amenities: ["Parking", "Pro Shop", "Coaching", "Tournament Facilities"],
        status: "approved",
      },
    ]

    setVenues(mockVenues)
    setFilteredVenues(mockVenues)
    setIsLoading(false)
  }, [])

  // Filter venues based on search and filters
  useEffect(() => {
    let filtered = venues.filter((venue) => venue.status === "approved")

    if (searchTerm) {
      filtered = filtered.filter(
        (venue) =>
          venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          venue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          venue.sports.some((sport) => sport.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (sportFilter !== "all") {
      filtered = filtered.filter((venue) => venue.sports.includes(sportFilter))
    }

    if (priceFilter !== "all") {
      filtered = filtered.filter((venue) => {
        switch (priceFilter) {
          case "low":
            return venue.priceRange.max <= 30
          case "medium":
            return venue.priceRange.min <= 50 && venue.priceRange.max > 30
          case "high":
            return venue.priceRange.min > 50
          default:
            return true
        }
      })
    }

    setFilteredVenues(filtered)
  }, [venues, searchTerm, sportFilter, priceFilter])

  const allSports = Array.from(new Set(venues.flatMap((venue) => venue.sports)))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading venues...</p>
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
              <Link href="/bookings">
                <Button variant="outline">My Bookings</Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline">Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sports Venues</h2>
          <p className="text-gray-600">Discover and book amazing sports facilities near you</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search venues, sports, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Sports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {allSports.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="low">Under $30/hour</SelectItem>
                <SelectItem value="medium">$30-50/hour</SelectItem>
                <SelectItem value="high">Over $50/hour</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSportFilter("all")
                setPriceFilter("all")
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredVenues.length} of {venues.length} venues
          </p>
        </div>

        {/* Venues Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <Card key={venue.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img src={venue.image || "/placeholder.svg"} alt={venue.name} className="w-full h-full object-cover" />
              </div>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span className="text-lg">{venue.name}</span>
                  <div className="flex items-center text-sm text-yellow-600">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    {venue.rating}
                    <span className="text-gray-500 ml-1">({venue.reviewCount})</span>
                  </div>
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {venue.location}
                  </div>
                  <p className="text-sm mb-3">{venue.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {venue.sports.map((sport) => (
                      <Badge key={sport} variant="secondary" className="text-xs">
                        {sport}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {venue.amenities.slice(0, 3).map((amenity) => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {venue.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{venue.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <div className="text-lg font-semibold text-indigo-600">
                    ${venue.priceRange.min}-${venue.priceRange.max}/hour
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/venues/${venue.id}`}>
                  <Button className="w-full">View Details & Book</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredVenues.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No venues found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSportFilter("all")
                setPriceFilter("all")
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
