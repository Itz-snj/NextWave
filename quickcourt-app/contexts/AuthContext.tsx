"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "user" | "owner" | "admin"
  avatar?: string
  phone?: string
  location?: string
  bio?: string
  preferences?: {
    emailNotifications: boolean
    smsNotifications: boolean
    privacyLevel: 'public' | 'friends' | 'private'
  }
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (userData: any) => Promise<boolean>
  logout: () => void
  verifyOTP: (otp: string) => Promise<boolean>
  updateUser: (userData: User) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem("quickcourt_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        localStorage.setItem("quickcourt_user", JSON.stringify(userData.user))
        localStorage.setItem("quickcourt_token", userData.token)
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const signup = async (userData: any): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        const result = await response.json()
        // Don't set user yet, wait for OTP verification
        return true
      }
      return false
    } catch (error) {
      console.error("Signup error:", error)
      return false
    }
  }

  const verifyOTP = async (otp: string): Promise<boolean> => {
    try {
      // Mock OTP verification - in real app, this would verify with backend
      console.log("OTP Verification:", otp)
      if (otp === "123456") {
        // Mock successful verification
        return true
      }
      return false
    } catch (error) {
      console.error("OTP verification error:", error)
      return false
    }
  }

  const updateUser = (userData: User) => {
    setUser(userData)
    localStorage.setItem("quickcourt_user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("quickcourt_user")
    localStorage.removeItem("quickcourt_token")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        verifyOTP,
        updateUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
