"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, MessageCircle, ArrowLeft, AlertCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { moneyEUR } from "@/lib/money"
import { openWhatsApp } from "@/lib/whatsapp"
import { createOrder } from "@/lib/api"
import { useTable } from "@/lib/table-context"
import type { CartItem } from "@/types/menu"

interface OrderConfirmationProps {
  cart: CartItem[]
  language: "es" | "en"
  tableNumber: string
  tip?: number
  itemNotes?: { [key: string]: string }
  onBack: () => void
  onOrderComplete: () => void
}

export default function OrderConfirmation({
  cart,
  language,
  tableNumber,
  tip = 0,
  itemNotes = {},
  onBack,
  onOrderComplete,
}: OrderConfirmationProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [orderId, setOrderId] = useState<string>("")
  const [serverTotal, setServerTotal] = useState<number | null>(null)
  const { t } = useI18n(language)
  const { token, orderType, isSessionExpired } = useTable()

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.unitPrice * item.qty, 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + tip
  }

  const enableOrderSend = process.env.NEXT_PUBLIC_WA_ENABLE_ORDER_SEND !== "false"

  const handleConfirmOrder = async () => {
    if ((orderType === "R" || orderType === "O") && isSessionExpired) {
      return
    }

    setIsProcessing(true)

    try {
      const clientTotal = calculateTotal()

      // Prepare cart data for API
      const gasCart = cart.map((item, index) => {
        const itemKey = `${item.id}-${index}`
        return {
          id: item.id,
          v: item.variantName || "",
          q: item.qty,
          p: item.persos.map((perso) => [perso.name, perso.price]),
          note: item.note || "",
          specialNote: itemNotes[itemKey] || "",
        }
      })

      const response = await createOrder({
        cart: gasCart,
        totalClient: clientTotal,
        tip,
        meta: {
          locale: language === "es" ? "es-ES" : "en-US",
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
          ua: navigator.userAgent,
          table: tableNumber,
          token: token || undefined,
          order_type: orderType,
        },
      })

      if (response.ok && response.orderId) {
        setOrderId(response.orderId)
        setServerTotal(response.serverTotal || clientTotal)
        setOrderCompleted(true)

        if (enableOrderSend) {
          setTimeout(() => {
            openWhatsApp({
              orderId: response.orderId,
              total: response.serverTotal || clientTotal,
              tip,
              itemNotes,
            })
          }, 1000)
        }

        // Clear cart and complete order
        setTimeout(
          () => {
            onOrderComplete()
          },
          enableOrderSend ? 2000 : 1500,
        )
      } else {
        throw new Error("Order creation failed or no orderId returned")
      }
    } catch (error) {
      console.error("[v0] Error creating order:", error)
      alert(t("orderError") || "Error al crear la orden. Por favor, intente nuevamente.")
      setIsProcessing(false)
    }
  }

  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-gray-100 rounded-2xl shadow-sm">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("orderConfirmed")}</h2>
            <p className="text-gray-600 mb-4">{t("orderConfirmedDesc")}</p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">{t("orderId")}</p>
              <p className="font-mono font-bold text-gray-900">{orderId}</p>
              <p className="text-sm text-gray-500 mt-2 mb-1">{t("total")}</p>
              <p className="text-xl font-bold text-gray-900">{moneyEUR(serverTotal || calculateTotal())}</p>
            </div>

            {enableOrderSend && (
              <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{t("whatsappOpened")}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">{t("confirmOrder")}</h1>
        </div>
      </header>

      <main className="p-4 pb-32">
        {(orderType === "R" || orderType === "O") && isSessionExpired && (
          <Card className="border-destructive bg-destructive/5 rounded-2xl shadow-sm mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-destructive/10 rounded-full p-3 flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-destructive mb-2">{t("sessionExpired")}</h3>
                  <p className="text-sm text-destructive/90 mb-3">
                    {t("sessionExpiredMessage")}.{" "}
                    {orderType === "R" ? t("sessionExpiredRestaurant") : t("sessionExpiredOnline")}
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    {orderType === "R" ? "Escanear QR Nuevamente" : "Solicitar Nuevo Enlace"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-gray-100 rounded-2xl shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">{t("orderSummary")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.map((item, index) => {
              const itemKey = `${item.id}-${index}`
              return (
                <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.img || "/placeholder.svg?height=48&width=48"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <span className="font-bold text-gray-900">{moneyEUR(item.unitPrice * item.qty)}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-orange-50 text-orange-600 text-xs">
                        {item.category}
                      </Badge>
                      <span className="text-sm text-gray-500">× {item.qty}</span>
                    </div>

                    {item.variantName && (
                      <Badge variant="outline" className="text-xs mb-2">
                        {item.variantName}
                      </Badge>
                    )}

                    {item.persos && item.persos.length > 0 && (
                      <div className="space-y-1 mb-2">
                        {item.persos.map((perso, i) => (
                          <div key={i} className="text-xs text-gray-600 flex justify-between">
                            <span>+ {perso.name}</span>
                            <span>{perso.free ? `(${t("free")})` : moneyEUR(perso.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {itemNotes[itemKey] && (
                      <p className="text-xs text-orange-600 italic mb-2 p-2 bg-orange-50 rounded-lg border border-orange-100">
                        <span className="font-medium">{t("specialNote")}:</span> "{itemNotes[itemKey]}"
                      </p>
                    )}

                    {item.note && <p className="text-xs text-gray-500 italic">"{item.note}"</p>}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="border-gray-100 rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t("subtotal")}</span>
                <span className="text-gray-900">{moneyEUR(calculateSubtotal())}</span>
              </div>
              {tip > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{t("tip")}</span>
                  <span className="text-gray-900">{moneyEUR(tip)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">{t("total")}</span>
                  <span className="text-2xl font-bold text-gray-900">{moneyEUR(calculateTotal())}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <p>{t("orderWillBeSent")}</p>
              {enableOrderSend && <p>{t("whatsappWillOpen")}</p>}
            </div>

            <Button
              onClick={handleConfirmOrder}
              disabled={isProcessing || ((orderType === "R" || orderType === "O") && isSessionExpired)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl h-14 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(orderType === "R" || orderType === "O") && isSessionExpired
                ? t("sessionExpired")
                : isProcessing
                  ? t("processing")
                  : t("confirmAndSend")}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
