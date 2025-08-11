"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, Users, Building, Clock, MapPin } from "lucide-react"
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
} from "recharts"

interface DashboardStats {
  totalBookings: number
  activeCourts: number
  monthlyEarnings: number
  totalCustomers: number
}

interface Booking {
  id: number
  customerName: string
  court: string
  sport: string
  date: string
  time: string
  duration: number
  amount: number
  status: "confirmed" | "completed" | "cancelled"
}

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
  const [isLoading, setIsLoading] = useState(true)

  // Mock chart data
  const bookingTrends = [
    { month: "Jan", bookings: 45, earnings: 1125 },
    { month: "Feb", bookings: 52, earnings: 1300 },
    { month: "Mar", bookings: 48, earnings: 1200 },
    { month: "Apr", bookings: 61, earnings: 1525 },
    { month: "May", bookings: 55, earnings: 1375 },
    { month: "Jun", bookings: 67, earnings: 1675 },
  ]

  const sportDistribution = [
    { name: "Badminton", value: 40, color: "#8884d8" },
    { name: "Tennis", value: 30, color: "#82ca9d" },
    { name: "Squash", value: 20, color: "#ffc658" },
    { name: "Table Tennis", value: 10, color: "#ff7300" },
  ]

  const peakHours = [
    { hour: "6:00", bookings: 2 },
    { hour: "8:00", bookings: 5 },
    { hour: "10:00", bookings: 8 },
    { hour: "12:00", bookings: 12 },
    { hour: "14:00", bookings: 15 },
    { hour: "16:00", bookings: 18 },
    { hour: "18:00", bookings: 25 },
    { hour: "20:00", bookings: 22 },
    { hour: "22:00", bookings: 8 },
  ]

  useEffect(() => {
    if (!user || user.role !== "owner") {
      router.push("/auth/login")
      return
    }

    // Mock data
    const mockStats: DashboardStats = {
      totalBookings: 156,
      activeCourts: 8,
      monthlyEarnings: 3850,
      totalCustomers: 89,
    }

    const mockBookings: Booking[] = [
      {
        id: 1,
        customerName: "John Smith",
        court: "Badminton Court 1",
        sport: "Badminton",
        date: "2024-01-15",
        time: "18:00",
        duration: 2,
        amount: 50,
        status: "confirmed",
      },
      {
        id: 2,
        customerName: "Sarah Johnson",
        court: "Tennis Court 1",
        sport: "Tennis",
        date: "2024-01-15",
        time: "16:00",
        duration: 1,
        amount: 40,
        status: "confirmed",
      },
      {
        id: 3,
        customerName: "Mike Davis",
        court: "Squash Court 1",
        sport: "Squash",
        date: "2024-01-14",
        time: "19:00",
        duration: 1,
        amount: 30,
        status: "completed",
      },
      {
        id: 4,
        customerName: "Emily Brown",
        court: "Badminton Court 2",
        sport: "Badminton",
        date: "2024-01-14",
        time: "20:00",
        duration: 1,
        amount: 25,
        status: "completed",
      },
    ]

    setStats(mockStats)
    setRecentBookings(mockBookings)
    setIsLoading(false)
  }, [user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
              <Link href="/">
                <h1 className="text-2xl font-bold text-indigo-600 cursor-pointer">QuickCourt</h1>
              </Link>
              <Badge variant="secondary">Facility Owner</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}!</span>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Manage your sports facility and track performance</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link href="/owner/facilities">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Building className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <h3 className="font-semibold">Manage Facilities</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/owner/courts">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <h3 className="font-semibold">Manage Courts</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/owner/bookings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <h3 className="font-semibold">View Bookings</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/owner/timeslots">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <h3 className="font-semibold">Time Slots</h3>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courts</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCourts}</div>
              <p className="text-xs text-muted-foreground">All courts operational</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlyEarnings}</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">+15 new this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Booking Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Trends</CardTitle>
              <CardDescription>Monthly bookings and earnings over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bookingTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="bookings" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="earnings" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sport Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Sport Distribution</CardTitle>
              <CardDescription>Breakdown of bookings by sport type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sportDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sportDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Peak Hours */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Peak Hours Analysis</CardTitle>
              <CardDescription>Booking frequency throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest court reservations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-semibold">{booking.customerName}</h4>
                      <p className="text-sm text-gray-600">
                        {booking.court} • {booking.sport}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">{new Date(booking.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">
                        {booking.time} ({booking.duration}h)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">${booking.amount}</p>
                      <Badge variant={booking.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/owner/bookings">
                <Button variant="outline">View All Bookings</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
