"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Star, Clock, Users, Wifi, Car, Coffee, Dumbbell, ArrowLeft, Trophy, CalendarDays, Ticket } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"

interface VenueApi {
  _id: string
  name: string
  description?: string
  location: string
  images?: string[]
  amenities?: string[]
  sports?: string[]
  rating?: number
  reviewCount?: number
  priceRange: { min: number; max: number }
  status: "approved" | "pending"
}

export default function VenueDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [venue, setVenue] = useState<VenueApi | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [courts, setCourts] = useState<any[]>([])
  const [selectedCourt, setSelectedCourt] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [slots, setSlots] = useState<any[]>([])

  useEffect(() => {
    const id = params.id as string
    if (!id) return
    setIsLoading(true)
    fetch(`/api/venues/${id}`)
      .then((r) => r.json())
      .then((data) => setVenue(data))
      .finally(() => setIsLoading(false))
  }, [params.id])

  useEffect(() => {
    if (!venue?._id) return
    fetch(`/api/courts?venue=${venue._id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCourts(data)
          if (data.length > 0) setSelectedCourt(String(data[0]._id))
        }
      })
  }, [venue?._id])

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedCourt || !selectedDate || !venue?._id) {
        setSlots([])
        return
      }
      const date = selectedDate.toISOString().slice(0, 10)
      const res = await fetch(`/api/timeslots?venue=${venue._id}&court=${selectedCourt}&date=${date}&cleanup=1`)
      const data = await res.json()
      setSlots(Array.isArray(data) ? data : [])
    }
    loadSlots()
  }, [selectedCourt, selectedDate, venue?._id])

  const amenityIcons: { [key: string]: React.ElementType } = {
    "Free Parking": Car,
    "WiFi": Wifi,
    "Cafeteria": Coffee,
    "Equipment Rental": Dumbbell,
    "Changing Rooms": Users,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-emerald-600 p-4 rounded-xl mb-4 inline-block">
             <Trophy className="h-10 w-10 text-white animate-pulse" />
          </div>
          <p className="text-lg text-gray-600">Loading Venue Details...</p>
        </div>
      </div>
    )
  }

  if (!venue || venue?.status !== "approved") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="text-center w-full max-w-lg">
           <CardHeader>
             <CardTitle>Venue Not Available</CardTitle>
             <CardDescription>This venue may be pending approval or does not exist.</CardDescription>
           </CardHeader>
           <CardContent>
             <Link href="/venues">
               <Button className="bg-emerald-600 hover:bg-emerald-700">Back to Venues</Button>
             </Link>
           </CardContent>
         </Card>
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
                <Button variant="outline" size="sm" onClick={() => router.back()} className="bg-transparent"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
                <Link href="/" className="flex items-center space-x-2">
                  <div className="bg-emerald-600 p-2 rounded-lg">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="hidden md:block text-2xl font-bold text-gray-900">NextWave</h1>
                </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/bookings">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">My Bookings</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Venue Header */}
        <div className="mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{venue.name}</h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600">
                <div className="flex items-center"><MapPin className="h-5 w-5 mr-2 text-emerald-600" /> {venue.location}</div>
                <div className="flex items-center text-yellow-500"><Star className="h-5 w-5 fill-current mr-1.5" /><span className="font-semibold text-gray-800">{venue.rating ?? 4.7}</span><span className="text-gray-500 ml-1">({venue.reviewCount ?? 0} reviews)</span></div>
              </div>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-2 mb-8">
              <img src={venue.images?.[0] || "/placeholder.svg"} alt={venue.name} className="col-span-2 w-full h-96 object-cover rounded-2xl"/>
              {venue.images?.slice(1, 3).map((img, i) => (
                <img key={i} src={img} alt={`${venue.name} view ${i+1}`} className="w-full h-48 object-cover rounded-2xl"/>
              ))}
            </div>

            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-xl">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-6"><Card className="bg-white rounded-2xl"><CardHeader><CardTitle>About {venue.name}</CardTitle></CardHeader><CardContent><p className="text-gray-700 leading-relaxed whitespace-pre-line">{venue.description}</p></CardContent></Card></TabsContent>
              <TabsContent value="amenities" className="mt-6"><Card className="bg-white rounded-2xl"><CardHeader><CardTitle>Amenities & Facilities</CardTitle></CardHeader><CardContent><div className="grid md:grid-cols-2 gap-4">{(venue.amenities || []).map(amenity => { const Icon = amenityIcons[amenity] || Clock; return (<div key={amenity} className="flex items-center space-x-3"><Icon className="h-5 w-5 text-emerald-600" /><span>{amenity}</span></div>) })}</div></CardContent></Card></TabsContent>
              <TabsContent value="reviews" className="mt-6"><Card className="bg-white rounded-2xl"><CardHeader><CardTitle>Customer Reviews</CardTitle><CardDescription>{venue.reviewCount ?? 0} reviews with an average rating of {venue.rating ?? 4.7}/5</CardDescription></CardHeader><CardContent><div className="text-sm text-gray-600">Review functionality is coming soon.</div></CardContent></Card></TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <Card className="sticky top-28 bg-white rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Book Your Slot</span>
                  <span className="text-lg font-bold text-emerald-600">
                    ₹{venue.priceRange.min} - ₹{venue.priceRange.max}
                  </span>
                </CardTitle>
                <CardDescription>Select a court, date and time to play.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="court-select" className="text-sm font-medium">Court / Sport</Label>
                    <select id="court-select" value={selectedCourt} onChange={(e) => setSelectedCourt(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md">
                      {courts.map(c => <option key={c._id} value={c._id}>{c.name} ({c.sport})</option>)}
                    </select>
                    {courts.length === 0 && <p className="text-xs text-muted-foreground mt-1">No courts found.</p>}
                  </div>

                  <div>
                    <Label htmlFor="date-select" className="text-sm font-medium">Date</Label>
                    <input id="date-select" type="date" className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md" onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)} defaultValue={selectedDate?.toISOString().slice(0,10)} />
                  </div>

                  {selectedDate && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Available Slots</Label>
                      {slots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map(s => (
                            <Button key={s._id} variant="outline" size="sm" className="flex-col h-auto" onClick={() => router.push(`/booking/${venue!._id}/${selectedCourt}?date=${selectedDate!.toISOString().slice(0,10)}&time=${s.time}`)}>
                              <span className="font-semibold">{s.time}</span>
                              <span className="text-xs text-emerald-600">₹{s.price}</span>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-md">No slots available for this date.</div>
                      )}
                    </div>
                  )}
                   <Button className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg" disabled={!selectedCourt || !selectedDate}>
                    <Ticket className="h-5 w-5 mr-2"/>
                    Proceed to Book
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}