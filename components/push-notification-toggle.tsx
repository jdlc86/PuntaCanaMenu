"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const VAPID_PUBLIC_KEY = "BLd_HHHyNZfuynzGXkyHW2MdbWmd8CFNOk5mFfQddaVO1pt7mM1taCZnTdDpUjSJF4konDzVFq1Up3Gjz5yIr-w"

export default function PushNotificationToggle() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPermissionDialog, setShowPermissionDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if push notifications are supported
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error("[v0] Error checking push subscription:", error)
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const subscribeToPush = async () => {
    setIsLoading(true)
    try {
      const currentPermission = Notification.permission

      if (currentPermission === "denied") {
        // Permission was previously denied, show instructions
        setShowPermissionDialog(true)
        setIsLoading(false)
        return
      }

      // Request notification permission
      const permission = await Notification.requestPermission()

      if (permission !== "granted") {
        setShowPermissionDialog(true)
        setIsLoading(false)
        return
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js")
      await navigator.serviceWorker.ready

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      // Send subscription to server
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      })

      if (response.ok) {
        setIsSubscribed(true)
        toast({
          title: "🔔 Notificaciones activadas",
          description: "Recibirás notificaciones sobre ofertas y novedades",
          duration: 3000,
        })
      } else {
        throw new Error("Failed to save subscription")
      }
    } catch (error) {
      console.error("[v0] Error subscribing to push:", error)
      toast({
        title: "❌ Error",
        description: "No se pudieron activar las notificaciones. Inténtalo de nuevo.",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribeFromPush = async () => {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe()

        // Notify server
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        setIsSubscribed(false)
        toast({
          title: "🔕 Notificaciones desactivadas",
          description: "Ya no recibirás notificaciones push",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("[v0] Error unsubscribing from push:", error)
      toast({
        title: "❌ Error",
        description: "No se pudieron desactivar las notificaciones. Inténtalo de nuevo.",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = () => {
    if (isSubscribed) {
      unsubscribeFromPush()
    } else {
      subscribeToPush()
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        disabled={isLoading}
        className={`relative transition-all duration-200 ${
          isSubscribed
            ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        }`}
        title={isSubscribed ? "Desactivar notificaciones" : "Activar notificaciones"}
      >
        {isSubscribed ? <Bell className="h-5 w-5 fill-current" /> : <BellOff className="h-5 w-5" />}
        {isSubscribed && <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />}
      </Button>

      <AlertDialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Notificaciones bloqueadas
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-left text-muted-foreground text-sm">
                <span className="block">
                  Las notificaciones están bloqueadas en tu navegador. Para activarlas, sigue estos pasos:
                </span>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Haz clic en el icono de candado 🔒 o información ℹ️ en la barra de direcciones</li>
                  <li>Busca la opción "Notificaciones" o "Permisos"</li>
                  <li>Cambia el permiso de "Bloqueado" a "Permitir"</li>
                  <li>Recarga la página y vuelve a hacer clic en la campanita</li>
                </ol>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowPermissionDialog(false)}>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
