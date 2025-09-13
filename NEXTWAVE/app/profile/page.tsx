"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { User, Phone, MapPin, Camera, ArrowLeft, Loader2, Edit3, Save, Trophy, LogOut, Settings, BarChart2 } from "lucide-react"
import Link from "next/link"

const roleBadgeStyles = {
  admin: "bg-red-100 text-red-800 border-red-200",
  owner: "bg-emerald-100 text-emerald-800 border-emerald-200",
  user: "bg-blue-100 text-blue-800 border-blue-200",
}

export default function ProfilePage() {
  const { user, logout, updateUser, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    avatar: "",
    bio: "",
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      privacyLevel: 'public'
    }
  })

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push("/auth/login")
      return
    }

    setProfileData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      location: user.location || "",
      avatar: user.avatar || "/placeholder-user.jpg",
      bio: user.bio || "",
      preferences: {
        emailNotifications: user.preferences?.emailNotifications ?? true,
        smsNotifications: user.preferences?.smsNotifications ?? false,
        privacyLevel: user.preferences?.privacyLevel ?? 'public'
      }
    })
  }, [user, authLoading, router])

  const handleSave = async () => {
    if (!user?.id) return
    const userId = user.id

    setIsLoading(true)
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, profileData }),
      })

      const data = await response.json()

      if (response.ok) {
        if (updateUser) updateUser(data.user)
        toast({ title: "Profile updated", description: "Your profile has been updated successfully." })
        setIsEditing(false)
      } else {
        toast({ title: "Update failed", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return
    const userId = user.id

    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validImageTypes.includes(file.type)) {
      toast({ title: "Invalid file type", variant: "destructive" });
      return
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({ title: "File too large (max 5MB)", variant: "destructive" });
      return
    }

    setIsUploading(true)
    try {
      const sigRes = await fetch('/api/uploads/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'avatars' }),
      })
      if (!sigRes.ok) throw new Error('Failed to get upload signature')
      
      const { timestamp, signature, apiKey, cloudName, folder } = await sigRes.json()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', timestamp.toString())
      formData.append('signature', signature)
      formData.append('folder', folder)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST', body: formData,
      })
      if (!uploadRes.ok) throw new Error('Cloudinary upload failed')

      const { secure_url: avatarUrl } = await uploadRes.json()

      const response = await fetch('/api/profile/update-avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, avatar: avatarUrl }),
      })

      if (!response.ok) throw new Error('Failed to update avatar in database')

      setProfileData(prev => ({ ...prev, avatar: avatarUrl }))
      if (updateUser) updateUser({ ...user, avatar: avatarUrl })
      toast({ title: "Avatar updated successfully" })
    } catch (error) {
      console.error('Avatar upload failed:', error)
      toast({ title: "Upload failed", description: "Could not upload your avatar.", variant: "destructive" })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!user) {
    return null
  }

  const userRole = user.role as keyof typeof roleBadgeStyles;

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
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={roleBadgeStyles[userRole] || roleBadgeStyles.user}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h2>
          <p className="text-gray-600">View and manage your account details and preferences.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="relative mx-auto w-28 h-28 mb-4">
                  <img src={profileData.avatar} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg" />
                  <button 
                    className="absolute bottom-1 right-1 bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 transition-colors shadow-md"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    aria-label="Upload new photo"
                  >
                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </div>
                <CardTitle className="text-2xl">{profileData.name}</CardTitle>
                <CardDescription>{profileData.email}</CardDescription>
                <p className="text-sm text-gray-600 mt-3 px-4">{profileData.bio || "No bio provided."}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                   <Badge className={roleBadgeStyles[userRole] || roleBadgeStyles.user}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge>
                   <Badge className="bg-gray-100 text-gray-800 border-gray-200">{profileData.location || "No Location"}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 {user.role === "owner" && (
                    <Link href="/owner/dashboard">
                      <Button variant="outline" className="w-full justify-start bg-transparent"><BarChart2 className="mr-2 h-4 w-4"/>Owner Dashboard</Button>
                    </Link>
                  )}
                 {user.role === "admin" && (
                    <Link href="/admin/dashboard">
                      <Button variant="outline" className="w-full justify-start bg-transparent"><BarChart2 className="mr-2 h-4 w-4"/>Admin Dashboard</Button>
                    </Link>
                  )}
                <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details here.</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="bg-emerald-600 hover:bg-emerald-700">
                      <Edit3 className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>Cancel</Button>
                      <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1"><Label htmlFor="name">Full Name</Label><Input id="name" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} disabled={!isEditing} /></div>
                  <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={profileData.email} disabled /></div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1"><Label htmlFor="phone">Phone</Label><Input id="phone" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} disabled={!isEditing} /></div>
                  <div className="space-y-1"><Label htmlFor="location">Location</Label><Input id="location" value={profileData.location} onChange={e => setProfileData({ ...profileData, location: e.target.value })} disabled={!isEditing} /></div>
                </div>
                <div className="space-y-1"><Label htmlFor="bio">Bio</Label><Textarea id="bio" value={profileData.bio} onChange={e => setProfileData({ ...profileData, bio: e.target.value })} disabled={!isEditing} rows={3} /></div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm">
              <CardHeader><CardTitle>Preferences & Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-xl"><Label htmlFor="emailNotifications">Email Notifications</Label><Switch id="emailNotifications" checked={profileData.preferences.emailNotifications} onCheckedChange={c => setProfileData(p => ({ ...p, preferences: { ...p.preferences, emailNotifications: c } }))} disabled={!isEditing} className="data-[state=checked]:bg-emerald-600" /></div>
                <div className="flex items-center justify-between p-4 border rounded-xl"><Label htmlFor="smsNotifications">SMS Notifications</Label><Switch id="smsNotifications" checked={profileData.preferences.smsNotifications} onCheckedChange={c => setProfileData(p => ({ ...p, preferences: { ...p.preferences, smsNotifications: c } }))} disabled={!isEditing} className="data-[state=checked]:bg-emerald-600" /></div>
                <div className="flex items-center justify-between p-4 border rounded-xl">
                  <Label>Profile Privacy</Label>
                  <Select value={profileData.preferences.privacyLevel} onValueChange={v => setProfileData(p => ({ ...p, preferences: { ...p.preferences, privacyLevel: v } }))} disabled={!isEditing}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="public">Public</SelectItem><SelectItem value="private">Private</SelectItem></SelectContent></Select>
                </div>
              </CardContent>
            </Card>

             <Card className="bg-white rounded-2xl shadow-sm border-red-200">
              <CardHeader><CardTitle className="text-red-800">Danger Zone</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-xl border-red-200 bg-red-50">
                    <div>
                      <h4 className="font-semibold text-red-800">Delete Account</h4>
                      <p className="text-sm text-red-600">This action is irreversible.</p>
                    </div>
                    <Button variant="destructive" size="sm">Delete</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}