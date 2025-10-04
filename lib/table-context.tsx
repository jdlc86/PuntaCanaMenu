"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { OrderType } from "@/types/menu"
import { decodeJWT } from "@/lib/jwt"
import { useToast } from "@/hooks/use-toast"
import type { Locale } from "@/lib/i18n"
import { translations } from "@/lib/i18n"

interface TableContextType {
  tableNumber: string
  orderType: OrderType
  token: string | null
  isValidated: boolean
  isLoading: boolean
  error: string | null
  timeRemaining: number | null
  isSessionExpired: boolean
  language: Locale
  setLanguage: (language: Locale) => void
  setTableData: (data: { tableNumber: string; orderType: string; token: string }) => void
  clearTableData: () => void
}

const TableContext = createContext<TableContextType | undefined>(undefined)

export function TableProvider({ children }: { children: ReactNode }) {
  const [tableNumber, setTableNumber] = useState<string>("")
  const [orderType, setOrderType] = useState<OrderType>("R")
  const [token, setToken] = useState<string | null>(null)
  const [isValidated, setIsValidated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isSessionExpired, setIsSessionExpired] = useState(false)
  const [hasShownWarning, setHasShownWarning] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("session_warning_shown") === "true"
    }
    return false
  })
  const [language, setLanguage] = useState<Locale>("es")
  const { toast } = useToast()

  const t = translations[language]

  useEffect(() => {
    console.log("[v0] TableProvider: Initializing token validation")

    const requireJWT = process.env.NEXT_PUBLIC_REQUIRE_JWT === "true"
    console.log("[v0] TableProvider: JWT required:", requireJWT)
    console.log("[v0] TableProvider: NEXT_PUBLIC_REQUIRE_JWT value:", process.env.NEXT_PUBLIC_REQUIRE_JWT)

    const urlParams = new URLSearchParams(window.location.search)
    const tokenParam = urlParams.get("token")

    console.log("[v0] TableProvider: URL search params:", window.location.search)
    console.log("[v0] TableProvider: All URL params:", Object.fromEntries(urlParams.entries()))

    if (tokenParam) {
      console.log("[v0] TableProvider: Token found in URL, validating...")
      validateToken(tokenParam)
    } else if (!requireJWT) {
      console.log("[v0] TableProvider: Development mode - no token required")
      const tableFromUrl = urlParams.get("mesa") || urlParams.get("table") || "1"
      const orderTypeFromUrl = (urlParams.get("order_type") || urlParams.get("type") || "R") as OrderType

      console.log("[v0] TableProvider: Table from URL:", tableFromUrl)
      console.log("[v0] TableProvider: Order type from URL:", orderTypeFromUrl)

      setTableNumber(tableFromUrl)
      setOrderType(orderTypeFromUrl)
      setIsValidated(true)
      setIsLoading(false)
      setError(null)

      sessionStorage.setItem("order_type", orderTypeFromUrl)

      console.log("[v0] TableProvider: Development mode initialized:", {
        table: tableFromUrl,
        orderType: orderTypeFromUrl,
      })
    } else {
      console.error("[v0] TableProvider: No token provided in URL (production mode)")
      setError(t.sessionExpiredRestaurant)
      setIsLoading(false)
      setIsValidated(false)
    }
  }, [])

  useEffect(() => {
    if (!token || (orderType !== "R" && orderType !== "O")) {
      return
    }

    const updateTimeRemaining = () => {
      const payload = decodeJWT(token)
      if (!payload || !payload.exp) {
        return
      }

      const now = Math.floor(Date.now() / 1000)
      const remaining = payload.exp - now

      setTimeRemaining(Math.max(0, remaining))

      if (remaining <= 300 && remaining > 0 && !hasShownWarning) {
        setHasShownWarning(true)
        sessionStorage.setItem("session_warning_shown", "true")

        const minutesLeft = Math.ceil(remaining / 60)
        const warningMessage =
          minutesLeft === 1
            ? t.sessionExpiringWarning.replace("5 minutos", "1 minuto")
            : t.sessionExpiringWarning.replace("5 minutos", `${minutesLeft} minutos`)

        toast({
          title: `⚠️ ${t.sessionExpiring}`,
          description: warningMessage,
          variant: "destructive",
        })
      }

      if (remaining <= 0 && !isSessionExpired) {
        setIsSessionExpired(true)

        const expiredMessage = orderType === "R" ? t.sessionExpiredRestaurant : t.sessionExpiredOnline

        toast({
          title: `❌ ${t.sessionExpired}`,
          description: expiredMessage,
          variant: "destructive",
        })
      }
    }

    updateTimeRemaining()

    const interval = setInterval(updateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [token, orderType, hasShownWarning, isSessionExpired, toast, t])

  const validateToken = async (tokenValue: string) => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("[v0] TableProvider: Sending token to validation endpoint")

      const response = await fetch("/api/validate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: tokenValue }),
      })

      const data = await response.json()
      console.log("[v0] TableProvider: Validation response:", data)

      if (data.valid && data.payload) {
        setTableNumber(data.payload.table_id)
        setOrderType(data.payload.order_type)
        setToken(tokenValue)
        setIsValidated(true)
        setError(null)
        console.log("[v0] TableProvider: Token validated successfully:", {
          table_id: data.payload.table_id,
          order_type: data.payload.order_type,
        })

        sessionStorage.setItem("table_token", tokenValue)
        sessionStorage.setItem("order_type", data.payload.order_type)
      } else {
        console.error("[v0] TableProvider: Token validation failed:", data.error)
        setError(`${t.sessionExpired}: ${data.error || t.sessionExpiredMessage}`)
        setIsValidated(false)
        setToken(null)
      }
    } catch (error) {
      console.error("[v0] TableProvider: Error validating token:", error)
      setError(t.sessionExpiredMessage)
      setIsValidated(false)
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const setTableData = (data: { tableNumber: string; orderType: string; token: string }) => {
    setTableNumber(data.tableNumber)
    setOrderType(data.orderType as OrderType)
    setToken(data.token)
    setIsValidated(true)
    setError(null)
  }

  const clearTableData = () => {
    setTableNumber("")
    setOrderType("R")
    setToken(null)
    setIsValidated(false)
    setError(null)
    setTimeRemaining(null)
    setIsSessionExpired(false)
    setHasShownWarning(false)
    sessionStorage.removeItem("table_token")
    sessionStorage.removeItem("order_type")
    sessionStorage.removeItem("session_warning_shown")
  }

  return (
    <TableContext.Provider
      value={{
        tableNumber,
        orderType,
        token,
        isValidated,
        isLoading,
        error,
        timeRemaining,
        isSessionExpired,
        language,
        setLanguage,
        setTableData,
        clearTableData,
      }}
    >
      {children}
    </TableContext.Provider>
  )
}

export function useTable() {
  const context = useContext(TableContext)
  if (context === undefined) {
    throw new Error("useTable must be used within a TableProvider")
  }
  return context
}
