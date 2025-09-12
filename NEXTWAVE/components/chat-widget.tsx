"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    botpressWebChatLoaded?: boolean
  }
}

export default function ChatWidget(): JSX.Element {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.botpressWebChatLoaded) return

    // Load Botpress webchat inject script
    const botpressInjectScript = document.createElement("script")
    botpressInjectScript.src = "https://cdn.botpress.cloud/webchat/v3.3/inject.js"
    botpressInjectScript.async = true
    document.head.appendChild(botpressInjectScript)

    // Load the specific bot configuration script
    const botConfigScript = document.createElement("script")
    botConfigScript.src = "https://files.bpcontent.cloud/2025/09/12/08/20250912081739-CBUR7451.js"
    botConfigScript.defer = true
    document.head.appendChild(botConfigScript)

    window.botpressWebChatLoaded = true

    // Cleanup function to remove scripts when component unmounts
    return () => {
      if (botpressInjectScript.parentNode) {
        botpressInjectScript.parentNode.removeChild(botpressInjectScript)
      }
      if (botConfigScript.parentNode) {
        botConfigScript.parentNode.removeChild(botConfigScript)
      }
    }
  }, [])

  return <></> // Botpress will inject its own UI
}


