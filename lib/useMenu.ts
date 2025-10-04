"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createClient, type RealtimeChannel } from "@supabase/supabase-js"
import type { MenuDish } from "@/types/menu"

type Lang = "es" | "en" | "de" | "fr" | "zh"

interface MenuPayload {
  dishes: MenuDish[]
  lastUpdated: string
}

const POLL_MS = 20_000

const SUPABASE_URL = "https://ncekoxdqjqfbkqrunezf.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jZWtveGRxanFmYmtxcnVuZXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxNzU5NzksImV4cCI6MjA1Mzc1MTk3OX0.tYvJQe_rJqLqJqLqJqLqJqLqJqLqJqLqJqLqJqLqJqI"

console.log("[v0] useMenu: Module loaded, SUPABASE_URL:", SUPABASE_URL)

export function useMenu(lang?: Lang) {
  console.log("[v0] useMenu: Hook called with lang:", lang)

  const [data, setData] = useState<MenuPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState<boolean>(false)
  const pollTimer = useRef<number | null>(null)

  const supabase = useMemo(() => {
    console.log("[v0] useMenu: Creating Supabase client")
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: { params: { eventsPerSecond: 2 } },
    })
    console.log("[v0] useMenu: Supabase client created:", !!client)
    return client
  }, [])

  const clearPoll = () => {
    if (pollTimer.current) {
      console.log("[v0] useMenu: Clearing poll timer")
      window.clearInterval(pollTimer.current)
      pollTimer.current = null
    }
  }

  const startPoll = () => {
    if (pollTimer.current) return
    console.log("[v0] useMenu: Starting poll timer")
    pollTimer.current = window.setInterval(() => {
      console.log("[v0] useMenu: Poll tick - refetching")
      void refetch()
    }, POLL_MS) as unknown as number
  }

  async function refetch() {
    console.log("[v0] useMenu: Refetch called")
    try {
      const res = await fetch("/api/menu", {
        headers: { "Cache-Control": "no-store" },
      })
      console.log("[v0] useMenu: Fetch response status:", res.status)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as MenuPayload
      console.log("[v0] useMenu: Received dishes:", json.dishes?.length || 0)
      setData(json)
    } catch (error) {
      const isNetworkError = error instanceof TypeError && error.message.includes("fetch")
      if (isNetworkError) {
        // Silently handle network errors - app is offline
        console.warn("[v0] useMenu: Network unavailable, keeping cached data")
      } else {
        // Log other errors normally
        console.error("[v0] useMenu: Refetch error:", error)
      }
      // Keep existing data if available, don't clear it on network error
      if (!data) {
        setData({ dishes: [], lastUpdated: new Date().toISOString() })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("[v0] useMenu: useEffect running")
    let channel: RealtimeChannel | null = null

    // Carga inicial
    console.log("[v0] useMenu: Initial refetch")
    void refetch()

    // Suscripción Realtime a la TABLA base (no a la vista)
    console.log("[v0] useMenu: Setting up realtime subscription")
    channel = supabase
      .channel("menu-items-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, (payload) => {
        console.log("[v0] useMenu: Realtime change detected:", payload)
        void refetch()
      })
      .subscribe((status) => {
        console.log("[v0] useMenu: Subscription status:", status)
        if (status === "SUBSCRIBED") {
          setConnected(true)
          clearPoll()
          console.log("[v0] useMenu: Realtime connected, refetching")
          void refetch()
        } else {
          setConnected(false)
          console.log("[v0] useMenu: Realtime not connected, starting poll")
          startPoll()
        }
      })

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        console.log("[v0] useMenu: Tab visible, refetching")
        void refetch()
      }
    }
    window.addEventListener("visibilitychange", onVisibility)

    return () => {
      console.log("[v0] useMenu: Cleanup")
      window.removeEventListener("visibilitychange", onVisibility)
      clearPoll()
      if (channel) supabase.removeChannel(channel)
    }
  }, [supabase])

  // Lista de platos
  const dishes = data?.dishes || []
  console.log("[v0] useMenu: Returning dishes:", dishes.length)

  return { data, dishes, loading, connected, refetch }
}
