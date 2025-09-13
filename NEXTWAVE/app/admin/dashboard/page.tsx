"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Building, Calendar, DollarSign, TrendingUp, UserCheck, AlertCircle , Trophy } from "lucide-react"
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
  Legend
} from "recharts"

interface AdminStats {
  totalUsers: number
  totalOwners: number
  totalBookings: number
  totalCourts: number
  pendingApprovals: number
  monthlyRevenue: number
  userGrowth: Array<{ month: string; users: number; owners: number }>
  bookingActivity: Array<{ month: string; bookings: number }>
  sportPopularity: Array<{ name: string; value: number; color: string }>
  revenueData: Array<{ month: string; revenue: number }>
  recentVenues: Array<{
    id: string
    name: string
    location: string
    courtCount: number
    status: string
    ownerName: string
    createdAt: string
  }>
}

interface SystemAlert {
  type: 'warning' | 'info' | 'success'
  title: string
  message: string
  icon: string
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalOwners: 0,
    totalBookings: 0,
    totalCourts: 0,
    pendingApprovals: 0,
    monthlyRevenue: 0,
    userGrowth: [],
    bookingActivity: [],
    sportPopularity: [],
    revenueData: [],
    recentVenues: []
  })
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/auth/login")
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch stats and alerts in parallel
        const [statsResponse, alertsResponse] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/alerts')
        ])

        if (!statsResponse.ok) {
          throw new Error('Failed to fetch statistics')
        }

        if (!alertsResponse.ok) {
          throw new Error('Failed to fetch alerts')
        }

        const statsData = await statsResponse.json()
        const alertsData = await alertsResponse.json()

        setStats(statsData)
        setAlerts(alertsData.alerts || [])
      } catch (err) {
        console.error('Error fetching admin data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertCircle className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
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
                <Badge className="bg-red-100 text-red-800 border-red-200">Administrator</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Welcome, {user?.name}!</span>
              <Link href="/profile">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Control Panel</h2>
          <p className="text-gray-600">A complete overview of the NextWave platform.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
           <Link href="/admin/facilities">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Building className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">Facility Approvals</h3>
                {stats.pendingApprovals > 0 && (
                  <Badge className="mt-2 bg-orange-100 text-orange-800 border-orange-200">
                    {stats.pendingApprovals} pending
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">User Management</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/reports">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">Reports</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/moderation">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">Moderation</h3>
              </CardContent>
            </Card>
          </Link>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-white"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalUsers}</div><p className="text-xs text-muted-foreground">+18% this month</p></CardContent></Card>
          <Card className="bg-white"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Venue Owners</CardTitle><UserCheck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalOwners}</div><p className="text-xs text-muted-foreground">+4 new this month</p></CardContent></Card>
          <Card className="bg-white"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Bookings</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalBookings}</div><p className="text-xs text-muted-foreground">+12% this month</p></CardContent></Card>
          <Card className="bg-white"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Listed Courts</CardTitle><Building className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalCourts}</div><p className="text-xs text-muted-foreground">Across all venues</p></CardContent></Card>
          <Card className="bg-white"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">₹{stats.monthlyRevenue.toLocaleString('en-IN')}</div><p className="text-xs text-muted-foreground">+24% this month</p></CardContent></Card>
          <Card className="bg-orange-50 border-orange-200"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-orange-800">Pending Approvals</CardTitle><AlertCircle className="h-4 w-4 text-orange-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-orange-800">{stats.pendingApprovals}</div><p className="text-xs text-orange-700">Action required</p></CardContent></Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-5 gap-8 mb-8">
          <Card className="lg:col-span-3 bg-white"><CardHeader><CardTitle>User Growth</CardTitle><CardDescription>Platform user and owner registration trends.</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><LineChart data={stats.userGrowth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Legend /><Line name="Players" type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} /><Line name="Owners" type="monotone" dataKey="owners" stroke="#14b8a6" strokeWidth={2} /></LineChart></ResponsiveContainer></CardContent></Card>
          <Card className="lg:col-span-2 bg-white"><CardHeader><CardTitle>Sport Popularity</CardTitle><CardDescription>Distribution of bookings by sport.</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={stats.sportPopularity} cx="50%" cy="50%" labelLine={false} innerRadius={60} outerRadius={100} fill="#8884d8" dataKey="value" label>{stats.sportPopularity.map((entry, index) => (<Cell key={`cell-${index}`} fill={['#10b981', '#14b8a6', '#38bdf8', '#f59e0b'][index % 4]} />))}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></CardContent></Card>
          <Card className="lg:col-span-5 bg-white"><CardHeader><CardTitle>Platform Revenue & Activity</CardTitle><CardDescription>Monthly revenue growth and booking volume.</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={stats.revenueData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" fontSize={12} /><YAxis yAxisId="left" orientation="left" stroke="#10b981" fontSize={12} tickFormatter={(value) => `₹${value/1000}k`} /><YAxis yAxisId="right" orientation="right" stroke="#14b8a6" fontSize={12} /><Tooltip /><Legend /><Bar yAxisId="left" name="Revenue (₹)" dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} /><Line yAxisId="right" name="Bookings" type="monotone" dataKey="bookings" stroke="#14b8a6" strokeWidth={2} /></BarChart></ResponsiveContainer></CardContent></Card>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="bg-white">
            <CardHeader><CardTitle>Recent Venue Submissions</CardTitle><CardDescription>Newest venues awaiting your approval.</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentVenues.length > 0 ? (
                  stats.recentVenues.map((venue) => (
                    <div key={venue.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50">
                      <div>
                        <h4 className="font-semibold">{venue.name} <span className="text-sm font-normal text-gray-500">- by {venue.ownerName}</span></h4>
                        <p className="text-sm text-gray-600">{venue.location}</p>
                      </div>
                      <Badge className={venue.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'}>{venue.status}</Badge>
                    </div>
                  ))
                ) : <p className="text-center py-4 text-gray-500">No pending venue approvals.</p>}
              </div>
              <div className="mt-6 text-center">
                <Link href="/admin/facilities"><Button variant="outline">View All Submissions</Button></Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader><CardTitle>System Alerts & Notifications</CardTitle><CardDescription>Important platform updates.</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length > 0 ? alerts.map((alert, index) => {
                  const alertStyles = {
                    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                    info: 'bg-blue-50 border-blue-200 text-blue-800',
                    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                  }[alert.type]
                  const Icon = { AlertCircle, Users, TrendingUp }[alert.icon] || AlertCircle;

                  return (
                    <div key={index} className={`flex items-start space-x-3 p-3 border rounded-xl ${alertStyles}`}>
                      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">{alert.title}</h4>
                        <p className="text-sm opacity-90">{alert.message}</p>
                      </div>
                    </div>
                  )
                }) : <p className="text-center py-4 text-gray-500">No system alerts at this time.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
