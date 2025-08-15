"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    chatWidgetScriptLoaded?: boolean
    ChatWidgetConfig?: Record<string, unknown>
  }
}

export default function ChatWidget(): JSX.Element {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.chatWidgetScriptLoaded) return

    window.ChatWidgetConfig = {
      projectId: "6899fda639a3f4065ff48809",
      // Configure widget to appear on left side bottom
      position: "bottom-left",
      theme: {
        primaryColor: "#4f46e5", // Match with your indigo theme
        borderRadius: "8px",
      }
    }

    const chatWidgetScript = document.createElement("script")
    chatWidgetScript.type = "text/javascript"
    chatWidgetScript.src = "https://storage.googleapis.com/cdwidget/dist/assets/js/main.js"
    chatWidgetScript.async = true
    document.body.appendChild(chatWidgetScript)

    window.chatWidgetScriptLoaded = true
  }, [])

  return (
    <div 
      id="cd-widget" 
      className="chat-widget-container"
      style={{
        // Ensure it stays in bottom-left position
        position: 'relative',
        zIndex: 1000
      }}
    />
  )
}


