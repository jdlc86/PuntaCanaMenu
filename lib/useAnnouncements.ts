"use client"

// lib/useAnnouncements.ts
import { useEffect, useMemo, useRef, useState } from "react"
import { createClient, type RealtimeChannel } from "@supabase/supabase-js"

type Lang = "es" | "en" | "de" | "fr" | "zh"
type AnnouncementsByLang = Record<Lang, string[]>

interface AnnouncementsPayload {
  announcements: AnnouncementsByLang
  lastUpdated: string
}

const POLL_MS = 20_000

const SUPABASE_URL = "https://ncekoxdqjqfbkqrunezf.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jZWtveGRxanFmYmtxcnVuZXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjUxMzkzOSwiZXhwIjoyMDcyMDg5OTM5fQ.YoOunxXqG18G9EiM4Wwu3dv0kVD4NFe5zreVlh3-WU0"

export function useAnnouncements(lang?: Lang) {
  const [data, setData] = useState<AnnouncementsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState<boolean>(false)
  const pollTimer = useRef<number | null>(null)

  const supabase = useMemo(() => {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { realtime: { params: { eventsPerSecond: 2 } } })
  }, [])

  const clearPoll = () => {
    if (pollTimer.current) {
      window.clearInterval(pollTimer.current)
      pollTimer.current = null
    }
  }

  const startPoll = () => {
    if (pollTimer.current) return
    pollTimer.current = window.setInterval(() => {
      void refetch()
    }, POLL_MS) as unknown as number
  }

  async function refetch() {
    try {
      const res = await fetch("/api/announcements", {
        headers: { "Cache-Control": "no-store" },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as AnnouncementsPayload
      setData(json)
    } catch (error) {
      const isNetworkError = error instanceof TypeError && error.message.includes("fetch")
      if (isNetworkError) {
        // Silently handle network errors - app is offline
        console.warn("[v0] useAnnouncements: Network unavailable, keeping cached data")
      } else {
        // Log other errors normally
        console.error("[v0] useAnnouncements: Refetch error:", error)
      }
      // Keep existing data if available, don't clear it on network error
      if (!data) {
        setData({ announcements: { es: [], en: [], de: [], fr: [], zh: [] }, lastUpdated: new Date().toISOString() })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let channel: RealtimeChannel | null = null

    // Carga inicial
    void refetch()

    // Suscripción Realtime a la TABLA base (no a la vista)
    channel = supabase
      .channel("announcements-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => {
        // Siempre refetch del endpoint que filtra alert y aplica la vista
        void refetch()
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnected(true)
          clearPoll()
          void refetch() // refetch inmediato al reconectar
        } else {
          setConnected(false)
          startPoll() // polling mientras no hay realtime
        }
      })

    const onVisibility = () => {
      if (document.visibilityState === "visible") void refetch()
    }
    window.addEventListener("visibilitychange", onVisibility)

    return () => {
      window.removeEventListener("visibilitychange", onVisibility)
      clearPoll()
      if (channel) supabase.removeChannel(channel)
    }
  }, [supabase])

  // Lista directa del idioma solicitado (opcional)
  const list = lang && data?.announcements ? data.announcements[lang] : undefined

  return { data, list, loading, connected, refetch }
}
