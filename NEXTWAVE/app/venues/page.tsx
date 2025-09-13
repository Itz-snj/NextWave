"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Search, Filter, Trophy, X } from "lucide-react"
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

export default function VenuesPage() {
  const [venues, setVenues] = useState<VenueApi[]>([])
  const [filteredVenues, setFilteredVenues] = useState<VenueApi[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sportFilter, setSportFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch("/api/venues")
      .then((r) => r.json())
      .then((data: VenueApi[]) => {
        const approved = data.filter((v) => v.status === "approved")
        setVenues(approved)
        setFilteredVenues(approved)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    let filtered = venues.filter(
      (v) =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.location || "").toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (sportFilter !== "all") {
      filtered = filtered.filter((v) => v.sports?.includes(sportFilter))
    }

    if (priceFilter !== "all") {
      const [min, max] = priceFilter.split("-").map(Number)
      filtered = filtered.filter((v) => {
        const venueMin = v.priceRange?.min ?? 0
        if (max) {
            return venueMin >= min && venueMin <= max
        }
        return venueMin >= min
      })
    }

    setFilteredVenues(filtered)
  }, [venues, searchTerm, sportFilter, priceFilter])

  const allSports = Array.from(new Set(venues.flatMap((venue) => venue.sports || [])))

  const clearFilters = () => {
    setSearchTerm("")
    setSportFilter("all")
    setPriceFilter("all")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-emerald-600 p-4 rounded-xl mb-4 inline-block">
             <Trophy className="h-10 w-10 text-white animate-pulse" />
          </div>
          <p className="text-lg text-gray-600">Loading Venues...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
             <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="bg-emerald-600 p-2 rounded-lg">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="hidden md:block text-2xl font-bold text-gray-900">NextWave</h1>
                </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/bookings"><Button variant="outline">My Bookings</Button></Link>
              <Link href="/profile"><Button variant="outline">Profile</Button></Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <section className="text-center py-12 bg-white rounded-2xl shadow-sm mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Perfect Venue</h1>
          <p className="text-lg text-gray-600">Discover and book top-rated sports facilities nearby you.</p>
        </section>

        {/* Search and Filters */}
        <Card className="p-6 mb-8 bg-white rounded-2xl shadow-sm">
          <div className="grid md:grid-cols-4 gap-4 items-center">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by venue name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="h-12"><SelectValue placeholder="All Sports" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {allSports.map((sport) => <SelectItem key={sport} value={sport}>{sport}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="h-12"><SelectValue placeholder="Price Range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-500">Under ₹500/hr</SelectItem>
                <SelectItem value="500-1000">₹500 - ₹1000/hr</SelectItem>
                <SelectItem value="1000-Infinity">Over ₹1000/hr</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Results Count and Clear Filters */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600 font-medium">Showing {filteredVenues.length} venues</p>
          <Button variant="ghost" onClick={clearFilters} className="text-emerald-600 hover:text-emerald-700">
            <X className="h-4 w-4 mr-2" /> Clear All Filters
          </Button>
        </div>

        {/* Venues Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVenues.map((venue) => (
            <Card key={venue._id} className="bg-white rounded-2xl overflow-hidden group hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-video relative overflow-hidden">
                <img src={venue.images?.[0] || venue.image || "/placeholder.svg"} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-3 right-3 bg-white/90 text-yellow-600 px-2 py-1 rounded-md text-sm font-semibold flex items-center">
                  <Star className="h-4 w-4 fill-current mr-1" /> {venue.rating ?? 4.7}
                </div>
              </div>
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(venue.sports || []).map((sport) => (
                    <Badge key={sport} className="bg-emerald-100 text-emerald-800 text-xs">{sport}</Badge>
                  ))}
                </div>
                <CardTitle>{venue.name}</CardTitle>
                <CardDescription className="flex items-center pt-1">
                  <MapPin className="h-4 w-4 mr-1.5" /> {venue.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="flex justify-between items-center">
                  <div className="text-lg font-bold text-emerald-600">
                    ₹{venue.priceRange?.min ?? 0}<span className="text-sm font-normal text-gray-500">/hour</span>
                  </div>
                  <Link href={`/venues/${venue._id}`}>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">Book Now</Button>
                  </Link>
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVenues.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Search className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Venues Found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or clearing the filters.</p>
            <Button onClick={clearFilters} className="bg-emerald-600 hover:bg-emerald-700">
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}