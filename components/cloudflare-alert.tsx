"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

type AlertType = "error" | "warning" | "info"

interface CloudflareAlertProps {
  language: "es" | "en" | "de" | "fr" | "zh"
}

export default function CloudflareAlert({ language }: CloudflareAlertProps) {
  const searchParams = useSearchParams()
  const [isVisible, setIsVisible] = useState(false)
  const [alertType, setAlertType] = useState<AlertType>("error")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const cfMessage = searchParams.get("cf_message")
    const cfType = searchParams.get("cf_type") as AlertType | null

    if (cfMessage) {
      setMessage(decodeURIComponent(cfMessage))
      setAlertType(cfType || "error")
      setIsVisible(true)
    }
  }, [searchParams])

  const texts = {
    es: {
      error: "Error",
      warning: "Advertencia",
      info: "Información",
      close: "Cerrar",
      retry: "Reintentar",
      scanAgain: "Escanear QR nuevamente",
    },
    en: {
      error: "Error",
      warning: "Warning",
      info: "Information",
      close: "Close",
      retry: "Retry",
      scanAgain: "Scan QR again",
    },
    de: {
      error: "Fehler",
      warning: "Warnung",
      info: "Information",
      close: "Schließen",
      retry: "Wiederholen",
      scanAgain: "QR erneut scannen",
    },
    fr: {
      error: "Erreur",
      warning: "Avertissement",
      info: "Information",
      close: "Fermer",
      retry: "Réessayer",
      scanAgain: "Scanner le QR à nouveau",
    },
    zh: {
      error: "错误",
      warning: "警告",
      info: "信息",
      close: "关闭",
      retry: "重试",
      scanAgain: "重新扫描二维码",
    },
  }

  const t = texts[language]

  const getIcon = () => {
    switch (alertType) {
      case "error":
        return <AlertCircle className="h-8 w-8 text-destructive" />
      case "warning":
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />
      case "info":
        return <Info className="h-8 w-8 text-blue-500" />
    }
  }

  const getTitle = () => {
    switch (alertType) {
      case "error":
        return t.error
      case "warning":
        return t.warning
      case "info":
        return t.info
    }
  }

  const getAlertVariant = () => {
    return alertType === "error" ? "destructive" : "default"
  }

  const handleClose = () => {
    setIsVisible(false)
    // Remove query parameters from URL
    const url = new URL(window.location.href)
    url.searchParams.delete("cf_message")
    url.searchParams.delete("cf_type")
    window.history.replaceState({}, "", url.toString())
  }

  const handleRetry = () => {
    window.location.href = window.location.origin
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border rounded-lg shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getIcon()}
              <h2 className="text-2xl font-bold text-foreground">{getTitle()}</h2>
            </div>
            {alertType !== "error" && (
              <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Alert variant={getAlertVariant()} className="border-2">
            <AlertDescription className="text-base">{message}</AlertDescription>
          </Alert>

          <div className="flex gap-3 pt-2">
            {alertType === "error" ? (
              <Button onClick={handleRetry} className="flex-1" size="lg">
                {t.scanAgain}
              </Button>
            ) : (
              <>
                <Button onClick={handleClose} variant="outline" className="flex-1 bg-transparent">
                  {t.close}
                </Button>
                <Button onClick={handleRetry} className="flex-1">
                  {t.retry}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
