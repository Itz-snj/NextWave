"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, Users, Building, Clock, MapPin, Trophy } from "lucide-react"
import Link from "next/link"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

interface DashboardStats {
  totalBookings: number
  activeCourts: number
  monthlyEarnings: number
  totalCustomers: number
  earningsGrowth?: string
  bookingGrowth?: string
  newCustomersThisMonth?: number
}

interface Booking {
  id: string
  customerName: string
  court: string
  sport: string
  venue: string
  date: string
  time: string
  duration: number
  amount: number
  status: "confirmed" | "cancelled"
}

// Define a color palette for the charts that matches the emerald theme
const CHART_COLORS = {
  emerald: "#10b981",
  teal: "#14b8a6",
  sky: "#38bdf8",
  amber: "#f59e0b",
}

const PIE_CHART_COLORS = [CHART_COLORS.emerald, CHART_COLORS.teal, CHART_COLORS.sky, CHART_COLORS.amber];


export default function OwnerDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    activeCourts: 0,
    monthlyEarnings: 0,
    totalCustomers: 0,
  })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [bookingTrends, setBookingTrends] = useState<any[]>([])
  const [sportDistribution, setSportDistribution] = useState<any[]>([])
  const [peakHours, setPeakHours] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)



  useEffect(() => {
    if (!user || user.role !== "owner") {
      router.push("/auth/login")
      return
    }

    const fetchDashboardData = async () => {
      try {
        // In a real app, you would replace these with your actual user ID.
        const ownerId = (user as any).id || (user as any)._id;

        const [statsResponse, chartsResponse] = await Promise.all([
          fetch(`/api/owner/dashboard/stats?ownerId=${ownerId}`),
          fetch(`/api/owner/dashboard/charts?ownerId=${ownerId}`),
        ]);
        
        const statsData = await statsResponse.json()
        const chartsData = await chartsResponse.json()
        
        if (statsResponse.ok) {
          setStats(statsData)
        }

        if (chartsResponse.ok) {
          setRecentBookings(chartsData.recentBookings || [])
          setBookingTrends(chartsData.bookingTrends || [])
          setSportDistribution(chartsData.sportDistribution || [])
          setPeakHours(chartsData.peakHours || [])
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-emerald-600 p-4 rounded-xl mb-4 inline-block">
             <Trophy className="h-10 w-10 text-white animate-pulse" />
          </div>
          <p className="text-lg text-gray-600">Loading your dashboard, please wait...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
             <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="bg-emerald-600 p-2 rounded-lg">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">NextWave</h1>
                </Link>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Facility Owner</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Welcome, {user?.name}!</span>
              <Link href="/profile">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Owner Dashboard</h2>
          <p className="text-gray-600">An overview of your business performance and activities.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
           <Link href="/owner/facilities">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Building className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">Manage Venues</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/owner/courts">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">Manage Courts</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/owner/bookings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">View Bookings</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/owner/timeslots">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">Time Slots</h3>
              </CardContent>
            </Card>
          </Link>
        </div>


        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.monthlyEarnings.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                {stats.earningsGrowth ? `${stats.earningsGrowth} from last month` : 'A great start!'}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                {stats.bookingGrowth ? `${stats.bookingGrowth} from last month` : 'Bookings are flowing in'}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.newCustomersThisMonth ? `+${stats.newCustomersThisMonth} new this month` : 'Building your community'}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courts</CardTitle>
              <Building className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCourts}</div>
              <p className="text-xs text-muted-foreground">Ready for action</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid lg:grid-cols-5 gap-8 mb-8">
          {/* Booking Trends */}
          <Card className="lg:col-span-3 bg-white">
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Monthly bookings and earnings over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                {bookingTrends.length > 0 ? (
                  <LineChart data={bookingTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line name="Bookings" type="monotone" dataKey="bookings" stroke={CHART_COLORS.emerald} strokeWidth={2} />
                    <Line name="Earnings (₹)" type="monotone" dataKey="earnings" stroke={CHART_COLORS.teal} strokeWidth={2} />
                  </LineChart>
                ) : (
                  <div className="flex items-center justify-center h-full"><p className="text-gray-500">No booking data available yet.</p></div>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sport Distribution */}
          <Card className="lg:col-span-2 bg-white">
            <CardHeader>
              <CardTitle>Sport Distribution</CardTitle>
              <CardDescription>Breakdown of bookings by sport.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                {sportDistribution.length > 0 ? (
                  <PieChart>
                   <Pie data={sportDistribution} cx="50%" cy="50%" labelLine={false} innerRadius={60} outerRadius={100} fill="#8884d8" dataKey="value" label>
                      {sportDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                ) : (
                   <div className="flex items-center justify-center h-full"><p className="text-gray-500">No sport data available yet.</p></div>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Peak Hours */}
          <Card className="lg:col-span-5 bg-white">
            <CardHeader>
              <CardTitle>Peak Hours Analysis</CardTitle>
              <CardDescription>Booking frequency by hour of the day to identify popular slots.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                {peakHours.length > 0 ? (
                  <BarChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip />
                    <Bar name="Number of Bookings" dataKey="bookings" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <div className="flex items-center justify-center h-full"><p className="text-gray-500">No peak hours data available yet.</p></div>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>A list of your most recent court reservations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="flex flex-wrap items-center justify-between p-4 border rounded-xl hover:bg-gray-50">
                    <div className="flex items-center space-x-4 mb-2 md:mb-0">
                      <div>
                        <h4 className="font-semibold text-gray-800">{booking.customerName}</h4>
                        <p className="text-sm text-gray-600">{booking.venue} • {booking.court} • <span className="font-medium text-emerald-700">{booking.sport}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="font-semibold">{new Date(booking.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">{booking.time} ({booking.duration}h)</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-emerald-600">₹{booking.amount.toLocaleString('en-IN')}</p>
                      </div>
                       <Badge className={`text-xs ${booking.status === "confirmed" ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                          {booking.status}
                        </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10"><p className="text-gray-500">You have no recent bookings.</p></div>
              )}
            </div>
            <div className="mt-6 text-center">
              <Link href="/owner/bookings">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">View All Bookings</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}