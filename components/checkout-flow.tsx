"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Check, MessageCircle, User } from "lucide-react"
import type { CartItem } from "@/types/menu"
import { createOrder } from "@/lib/api"
import { useTable } from "@/lib/table-context"
import { useOnlineStatus, isNetworkError } from "@/hooks/use-online-status"
import { t } from "@/lib/i18n"

interface CheckoutFlowProps {
  cart: CartItem[]
  language: "es" | "en"
  onBack: () => void
  subtotal: number
}

export default function CheckoutFlow({ cart, language, onBack, subtotal }: CheckoutFlowProps) {
  const [customerName, setCustomerName] = useState("")
  const [selectedTip, setSelectedTip] = useState("10")
  const [confirmationMethod, setConfirmationMethod] = useState("mesa")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { tableNumber } = useTable()

  const isOnline = useOnlineStatus()

  const texts = {
    es: {
      checkout: "Finalizar Pedido",
      orderSummary: "Resumen del Pedido",
      customerName: "Nombre del Cliente",
      customerNamePlaceholder: "Tu nombre (opcional)",
      tip: "Propina",
      noTip: "Sin propina",
      confirmationMethod: "Método de Confirmación",
      inTable: "Confirmar en mesa",
      whatsapp: "Enviar por WhatsApp",
      subtotal: "Subtotal",
      total: "Total",
      submitOrder: "Enviar Pedido",
      submitting: "Enviando...",
      orderSuccess: "¡Pedido Enviado!",
      orderSuccessMessage: "Tu pedido ha sido enviado correctamente. El personal será notificado.",
      backToMenu: "Volver al Menú",
      quantity: "Cantidad",
      noConnectionDesc: "No hay conexión a internet",
      networkErrorDesc: "Error de red",
      serverErrorDesc: "Error del servidor",
    },
    en: {
      checkout: "Checkout",
      orderSummary: "Order Summary",
      customerName: "Customer Name",
      customerNamePlaceholder: "Your name (optional)",
      tip: "Tip",
      noTip: "No tip",
      confirmationMethod: "Confirmation Method",
      inTable: "Confirm at table",
      whatsapp: "Send via WhatsApp",
      subtotal: "Subtotal",
      total: "Total",
      submitOrder: "Submit Order",
      submitting: "Submitting...",
      orderSuccess: "Order Sent!",
      orderSuccessMessage: "Your order has been sent successfully. Staff will be notified.",
      backToMenu: "Back to Menu",
      quantity: "Quantity",
      noConnectionDesc: "No internet connection",
      networkErrorDesc: "Network error",
      serverErrorDesc: "Server error",
    },
  }

  const tipOptions = [
    { value: "0", label: texts[language].noTip },
    { value: "5", label: "5%" },
    { value: "10", label: "10%" },
    { value: "15", label: "15%" },
    { value: "20", label: "20%" },
  ]

  const calculateTip = () => {
    return subtotal * (Number.parseInt(selectedTip) / 100)
  }

  const calculateTotal = () => {
    return subtotal + calculateTip()
  }

  const handleSubmitOrder = async () => {
    if (!isOnline) {
      setError(t(language, "noConnectionDesc"))
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const tipAmount = calculateTip()
      const total = calculateTotal()

      const cartData = cart.map((item) => ({
        id: item.dish.id.toString(),
        q: item.quantity,
        p: [[language === "es" ? item.dish.name : item.dish.nameEn, item.dish.price]] as [string, number][],
        note: item.notes || undefined,
        variant: item.variantName || undefined,
        personalizations: item.personalizations || undefined,
      }))

      const orderPayload = {
        cart: cartData,
        totalClient: total,
        tip: Number.parseInt(selectedTip),
        meta: {
          table: tableNumber,
          customerName: customerName || undefined,
          subtotal: subtotal,
          tipAmount: tipAmount,
          confirmationMethod: confirmationMethod,
        },
      }

      console.log("[v0] Submitting order:", orderPayload)

      const result = await createOrder(orderPayload)

      if (result.ok) {
        console.log("[v0] Order created successfully:", result.orderId)
        setOrderSubmitted(true)
      } else {
        throw new Error(result.message || "Failed to create order")
      }
    } catch (err) {
      console.error("[v0] Error submitting order:", err)
      const isNetwork = isNetworkError(err)
      const errorMessage = isNetwork
        ? t(language, "networkErrorDesc")
        : err instanceof Error
          ? err.message
          : t(language, "serverErrorDesc")
      setError(errorMessage)
      setIsSubmitting(false)
    }
  }

  const enableOrderSend = process.env.NEXT_PUBLIC_WA_ENABLE_ORDER_SEND !== "false"

  if (orderSubmitted) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{texts[language].orderSuccess}</h2>
            <p className="text-muted-foreground mb-6">{texts[language].orderSuccessMessage}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              {texts[language].backToMenu}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{texts[language].checkout}</h1>
        </div>

        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="p-4">
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{texts[language].orderSummary}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item, index) => (
                <div key={`${item.dish.id}-${index}`} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">
                      {language === "es" ? item.dish.name : item.dish.nameEn}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {texts[language].quantity}: {item.quantity} × €{item.dish.price.toFixed(2)}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground italic mt-1">
                        "{item.notes.length > 50 ? `${item.notes.substring(0, 50)}...` : item.notes}"
                      </p>
                    )}
                    {item.variantName && (
                      <p className="text-xs text-muted-foreground italic mt-1">"{item.variantName}"</p>
                    )}
                    {item.personalizations && (
                      <p className="text-xs text-muted-foreground italic mt-1">"{item.personalizations.join(", ")}"</p>
                    )}
                  </div>
                  <span className="font-semibold text-primary">€{(item.dish.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                {texts[language].customerName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder={texts[language].customerNamePlaceholder}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Tip Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{texts[language].tip}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedTip} onValueChange={setSelectedTip}>
                <div className="grid grid-cols-3 gap-4">
                  {tipOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`tip-${option.value}`} />
                      <Label htmlFor={`tip-${option.value}`} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Confirmation Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{texts[language].confirmationMethod}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={confirmationMethod} onValueChange={setConfirmationMethod}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mesa" id="mesa" />
                    <Label htmlFor="mesa" className="cursor-pointer">
                      {texts[language].inTable}
                    </Label>
                  </div>
                  {enableOrderSend && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="whatsapp" id="whatsapp" />
                      <Label htmlFor="whatsapp" className="cursor-pointer flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {texts[language].whatsapp}
                      </Label>
                    </div>
                  )}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Total Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>{texts[language].subtotal}</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    {texts[language].tip} ({selectedTip}%)
                  </span>
                  <span>€{calculateTip().toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold text-foreground">
                  <span>{texts[language].total}</span>
                  <span className="text-primary">€{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            size="lg"
          >
            {isSubmitting ? texts[language].submitting : texts[language].submitOrder}
          </Button>
        </div>
      </div>
    </div>
  )
}
