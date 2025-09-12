"use client"

import ChatWidget from "@/components/chat-widget"
import { useAuth } from "@/contexts/AuthContext"
import { usePathname } from "next/navigation"

export default function ConditionalChatWidget(): JSX.Element | null {
  const { user } = useAuth()
  const pathname = usePathname()
  
  // Show for non-logged-in users OR users with "user" role
  // Hide for admin and owner roles
  if (user && (user.role === "admin" || user.role === "owner")) {
    return null
  }
  
  // Hide on auth pages, admin pages, and owner pages
  const isRestrictedPage = pathname && 
                          (pathname.startsWith('/auth') || 
                           pathname.startsWith('/admin') || 
                           pathname.startsWith('/owner'))
  
  if (isRestrictedPage) return null
  
  return <ChatWidget />
}


