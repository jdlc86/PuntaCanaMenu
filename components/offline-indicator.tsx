"use client"

import { useEffect, useState, useRef } from "react"
import { WifiOff, Wifi } from "lucide-react"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useTable } from "@/lib/table-context"
import { t } from "@/lib/i18n"

export default function OfflineIndicator() {
  const isOnline = useOnlineStatus()
  const { language } = useTable()
  const [showOffline, setShowOffline] = useState(false)
  const [showRestored, setShowRestored] = useState(false)
  const restoredTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    console.log("[v0] OfflineIndicator: isOnline changed", { isOnline, showOffline, showRestored })

    if (!isOnline) {
      // Connection lost
      console.log("[v0] OfflineIndicator: Connection lost, showing offline indicator")
      setShowOffline(true)
      setShowRestored(false)
      // Clear any existing timer
      if (restoredTimerRef.current) {
        clearTimeout(restoredTimerRef.current)
        restoredTimerRef.current = null
      }
    } else if (showOffline) {
      // Connection was restored
      console.log("[v0] OfflineIndicator: Connection restored, showing restored indicator")
      setShowOffline(false)
      setShowRestored(true)
    }
  }, [isOnline, showOffline])

  useEffect(() => {
    if (showRestored) {
      console.log("[v0] OfflineIndicator: Setting timer to hide restored message in 3 seconds")
      restoredTimerRef.current = setTimeout(() => {
        console.log("[v0] OfflineIndicator: Hiding restored message")
        setShowRestored(false)
        restoredTimerRef.current = null
      }, 3000)

      return () => {
        if (restoredTimerRef.current) {
          console.log("[v0] OfflineIndicator: Clearing restored message timer")
          clearTimeout(restoredTimerRef.current)
          restoredTimerRef.current = null
        }
      }
    }
  }, [showRestored])

  if (!showOffline && !showRestored) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] pointer-events-none">
      <div
        className={`mx-auto max-w-md mt-16 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          showOffline ? "bg-destructive text-destructive-foreground" : "bg-green-600 text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          {showOffline ? <WifiOff className="h-5 w-5 flex-shrink-0" /> : <Wifi className="h-5 w-5 flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">
              {showOffline ? t(language, "noConnection") : t(language, "connectionRestored")}
            </p>
            <p className="text-xs opacity-90 mt-0.5">
              {showOffline ? t(language, "noConnectionDesc") : t(language, "connectionRestoredDesc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
