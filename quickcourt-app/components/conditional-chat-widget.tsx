"use client"

import ChatWidget from "@/components/chat-widget"
import { useAuth } from "@/contexts/AuthContext"

export default function ConditionalChatWidget(): JSX.Element | null {
  const { user } = useAuth()
  if (!user || user.role !== "user") return null
  return <ChatWidget />
}


