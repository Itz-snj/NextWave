import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface UseProtectedRouteOptions {
  requiredRole?: 'user' | 'owner' | 'admin'
  redirectTo?: string
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { requiredRole, redirectTo = '/auth/login' } = options

  useEffect(() => {
    // Don't redirect if still loading auth state
    if (isLoading) return

    // Check if user is authenticated
    if (!user) {
      router.push(redirectTo)
      return
    }

    // Check if user has required role
    if (requiredRole && user.role !== requiredRole) {
      // Redirect to appropriate dashboard based on user role
      switch (user.role) {
        case 'admin':
          router.push('/admin/dashboard')
          break
        case 'owner':
          router.push('/owner/dashboard')
          break
        case 'user':
          router.push('/')
          break
        default:
          router.push('/auth/login')
      }
      return
    }
  }, [user, isLoading, router, requiredRole, redirectTo])

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isLoading
  }
}