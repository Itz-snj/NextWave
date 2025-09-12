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
  verifyOTP: (email: string, otp: string) => Promise<boolean>
  updateUser: (userData: User) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔍 AuthContext: Initializing authentication...")
        const storedUser = localStorage.getItem("quickcourt_user")
        const storedToken = localStorage.getItem("quickcourt_token")
        
        console.log("🔍 AuthContext: Stored data exists:", { 
          hasUser: !!storedUser, 
          hasToken: !!storedToken 
        })
        
        if (storedUser && storedToken) {
          console.log("🔍 AuthContext: Validating session with backend...")
          // Validate the stored session by making a request to verify user
          try {
            const response = await fetch("/api/auth/validate-session", {
              method: "GET",
              headers: { 
                "Authorization": `Bearer ${storedToken}`,
                "Content-Type": "application/json" 
              },
            })
            
            console.log("🔍 AuthContext: Session validation response:", response.status)
            
            if (response.ok) {
              const userData = await response.json()
              console.log("✅ AuthContext: Session valid, setting user:", userData.user.email)
              setUser(userData.user)
            } else {
              console.log("❌ AuthContext: Session invalid, clearing storage")
              // Session invalid, clear stored data
              localStorage.removeItem("quickcourt_user")
              localStorage.removeItem("quickcourt_token")
              setUser(null)
            }
          } catch (error) {
            // If validation fails, try to use stored user data as fallback
            console.warn("⚠️ AuthContext: Session validation failed, using stored data:", error)
            const parsedUser = JSON.parse(storedUser)
            console.log("🔄 AuthContext: Using fallback user:", parsedUser.email)
            setUser(parsedUser)
          }
        } else {
          console.log("ℹ️ AuthContext: No stored session found")
        }
      } catch (error) {
        console.error("💥 AuthContext: Auth initialization error:", error)
      } finally {
        console.log("🏁 AuthContext: Auth initialization complete, setting loading to false")
        setIsLoading(false)
      }
    }
    
    initializeAuth()
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

  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      if (response.ok) {
        const result = await response.json()
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
