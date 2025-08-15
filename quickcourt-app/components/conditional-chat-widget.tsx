"use client"

import ChatWidget from "@/components/chat-widget"
import { useAuth } from "@/contexts/AuthContext"
import { usePathname } from "next/navigation"

export default function ConditionalChatWidget(): JSX.Element | null {
  const { user } = useAuth()
  const pathname = usePathname()
  
  // Only show for logged-in users with "user" role
  if (!user || user.role !== "user") return null
  
  // Only show on user-specific pages (not on auth pages, admin pages, owner pages)
  const isUserPage = pathname && 
                     !pathname.startsWith('/auth') && 
                     !pathname.startsWith('/admin') && 
                     !pathname.startsWith('/owner')
  
  if (!isUserPage) return null
  
  return (
    <div className="fixed bottom-4 left-4 z-[9999] chat-widget-container">
      <ChatWidget />
    </div>
  )
}


