"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Trophy, Loader2, MailCheck } from "lucide-react"

// --- FIX ---
// AuthLayout is now defined OUTSIDE the SignupPage component.
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
    <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
      <div className="absolute inset-0 bg-emerald-800" />
      <img
        src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop"
        alt="Sports field"
        className="absolute inset-0 h-full w-full object-cover opacity-20"
      />
      <div className="relative z-20 flex items-center text-2xl font-bold space-x-2">
        <Trophy className="h-8 w-8" />
        <span>NextWave</span>
      </div>
      <div className="relative z-20 mt-auto">
        <blockquote className="space-y-2">
          <p className="text-lg">
            “The only place success comes before work is in the dictionary. This platform makes the 'work' part of finding a venue effortless.”
          </p>
          <footer className="text-sm">- Sports Enthusiast</footer>
        </blockquote>
      </div>
    </div>
    <div className="flex items-center justify-center py-12 px-4">{children}</div>
  </div>
)

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [otp, setOtp] = useState("")
  const [isResendingOTP, setIsResendingOTP] = useState(false)
  const { signup, verifyOTP } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      const success = await signup(formData)
      if (success) {
        setShowOTP(true)
        toast({ title: "OTP Sent", description: "Please check your email for the verification code." })
      } else {
        toast({ title: "Signup Failed", description: "An account with this email may already exist.", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsResendingOTP(true)
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      })
      if (response.ok) {
        toast({ title: "OTP Resent", description: "A new OTP has been sent." })
        setOtp("")
      } else {
        toast({ title: "Failed to resend OTP", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to resend OTP.", variant: "destructive" })
    } finally {
      setIsResendingOTP(false)
    }
  }

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const success = await verifyOTP(formData.email, otp)
      if (success) {
        toast({ title: "Email Verified!", description: "Welcome to NextWave. Please log in." })
        router.push("/auth/login")
      } else {
        toast({ title: "Invalid OTP", description: "Please check the code and try again.", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Verification Error", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  if (showOTP) {
    return (
      <AuthLayout>
        <div className="mx-auto grid w-[380px] gap-6">
          <div className="grid gap-2 text-center">
            <MailCheck className="h-10 w-10 mx-auto text-emerald-600"/>
            <h1 className="text-3xl font-bold">Verify Your Email</h1>
            <p className="text-balance text-muted-foreground">
              Enter the 6-digit code sent to <span className="font-semibold text-emerald-700">{formData.email}</span>
            </p>
          </div>
          <form onSubmit={handleOTPVerification} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder="123456" maxLength={6} />
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Account
            </Button>
             <Button type="button" variant="outline" className="w-full" onClick={handleResendOTP} disabled={isResendingOTP}>
                {isResendingOTP && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Resend Code
              </Button>
          </form>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="mx-auto grid w-[380px] gap-6">
        <div className="grid gap-2 text-center">
          <Trophy className="h-10 w-10 mx-auto text-emerald-600"/>
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-balance text-muted-foreground">
            Join the NextWave community today!
          </p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" type="text" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="role">I am a...</Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger><SelectValue placeholder="Select account type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Player / User</SelectItem>
                <SelectItem value="owner">Venue Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="underline text-emerald-600 font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}