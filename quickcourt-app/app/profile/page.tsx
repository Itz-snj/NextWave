"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { User, Phone, MapPin, Camera, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    avatar: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    setProfileData({
      name: user.name || "",
      email: user.email || "",
      phone: "+1 (555) 123-4567", // Mock data
      location: "New York, NY", // Mock data
      avatar: user.avatar || "/placeholder.svg?height=100&width=100",
    })
  }, [user, router])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!user) {
    return null
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
              <Badge variant={user.role === "admin" ? "destructive" : user.role === "owner" ? "secondary" : "default"}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h2>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="relative mx-auto w-24 h-24 mb-4">
                  <img
                    src={profileData.avatar || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <CardTitle>{profileData.name}</CardTitle>
                <CardDescription>{profileData.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{profileData.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{profileData.location}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <Badge
                    variant={user.role === "admin" ? "destructive" : user.role === "owner" ? "secondary" : "default"}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.role === "user" && (
                  <>
                    <Link href="/bookings">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        My Bookings
                      </Button>
                    </Link>
                    <Link href="/venues">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        Browse Venues
                      </Button>
                    </Link>
                  </>
                )}
                {user.role === "owner" && (
                  <>
                    <Link href="/owner/dashboard">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        Owner Dashboard
                      </Button>
                    </Link>
                    <Link href="/owner/facilities">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        Manage Facilities
                      </Button>
                    </Link>
                  </>
                )}
                {user.role === "admin" && (
                  <>
                    <Link href="/admin/dashboard">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        Admin Dashboard
                      </Button>
                    </Link>
                    <Link href="/admin/facilities">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        Facility Approvals
                      </Button>
                    </Link>
                  </>
                )}
                <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  ) : (
                    <div className="space-x-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive booking confirmations and updates</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Privacy Settings</h4>
                    <p className="text-sm text-gray-600">Control your profile visibility</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Change Password</h4>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50">
                  <div>
                    <h4 className="font-semibold text-red-800">Delete Account</h4>
                    <p className="text-sm text-red-600">Permanently delete your account and data</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete
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
