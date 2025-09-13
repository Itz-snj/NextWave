"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Loader2, LogIn, Trophy } from "lucide-react"

// --- FIX ---
// AuthLayout is now defined OUTSIDE the LoginPage component.
// This prevents it from being re-created on every state change.
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
    <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
      <div className="absolute inset-0 bg-emerald-800" />
      <img
        src="https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=1974&auto=format&fit=crop"
        alt="Sports stadium"
        className="absolute inset-0 h-full w-full object-cover opacity-20"
      />
     <Link href="/"> <div className="relative z-20 flex items-center text-2xl font-bold space-x-2">
        <Trophy className="h-8 w-8" />
        <span>NextWave</span>
      </div></Link>
      <div className="relative z-20 mt-auto">
        <blockquote className="space-y-2">
          <p className="text-lg">
            “The moment of victory is much too short to live for that and nothing else. This platform helps you enjoy the journey.”
          </p>
          <footer className="text-sm">- Martina Navratilova (adapted)</footer>
        </blockquote>
      </div>
    </div>
    <div className="flex items-center justify-center py-12 px-4">{children}</div>
  </div>
)

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const user = await login(email, password)
      if (user) {
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${user}!`,
        })
        router.push("/") 
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "An Error Occurred",
        description: "Something went wrong during login.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mx-auto grid w-[380px] gap-6">
        <div className="grid gap-2 text-center">
           <LogIn className="h-10 w-10 mx-auto text-emerald-600"/>
          <h1 className="text-3xl font-bold">Welcome Back!</h1>
          <p className="text-balance text-muted-foreground">
            Enter your credentials to access your account.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline text-emerald-600">
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="underline text-emerald-600 font-semibold">
            Sign up
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}