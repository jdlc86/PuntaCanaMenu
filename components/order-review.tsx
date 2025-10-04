"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Edit3, Minus, Plus, Trash2, MessageSquare, CheckCircle2 } from "lucide-react"
import { useI18n, translateCategory } from "@/lib/i18n"
import { moneyEUR } from "@/lib/money"
import { openWhatsApp } from "@/lib/whatsapp"
import { createOrder } from "@/lib/api"
import type { CartItem, MenuDish, OrderType } from "@/types/menu"
import DishModal from "@/components/dish-modal"
import { useOnlineStatus, isNetworkError } from "@/hooks/use-online-status"

interface OrderReviewProps {
  cart: CartItem[]
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  language: "es" | "en"
  tableNumber: string
  onBack: () => void
  menu: MenuDish[]
  token: string | null
  orderType: OrderType
}

interface OrderSuccessData {
  orderId: string
  total: number
  tip: number
}

export default function OrderReview({
  cart,
  setCart,
  language,
  tableNumber,
  onBack,
  menu,
  token,
  orderType,
}: OrderReviewProps) {
  const [editingItem, setEditingItem] = useState<{ item: CartItem; index: number } | null>(null)
  const [selectedTip, setSelectedTip] = useState<number>(0)
  const [customTipAmount, setCustomTipAmount] = useState<string>("")
  const [showNoteInput, setShowNoteInput] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccessData | null>(null)
  const { t } = useI18n(language)
  const isOnline = useOnlineStatus()

  const tipOptions = [
    { label: t("noTip"), value: 0 },
    { label: "10%", value: 0.1 },
    { label: t("customTip"), value: -1 }, // -1 indicates custom amount
  ]

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(index)
      return
    }

    setCart((prev) => {
      const updated = [...prev]
      updated[index].qty = isNaN(newQuantity) ? 1 : Math.max(1, Math.floor(newQuantity))
      return updated
    })
  }

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  const clearCart = () => {
    setCart([])
    setSelectedTip(0)
    setCustomTipAmount("")
    onBack()
  }

  const calculateSubtotal = () => {
    if (!cart || cart.length === 0) return 0
    const subtotal = cart.reduce((total, item) => {
      let itemPrice = 0
      if (typeof item.unitPrice === "number" && !isNaN(item.unitPrice)) {
        itemPrice = item.unitPrice
      } else {
        itemPrice = item.price || 0
        if (item.persos && item.persos.length > 0) {
          const persosPrice = item.persos.reduce((sum, perso) => sum + (perso.price || 0), 0)
          itemPrice += persosPrice
        }
      }

      const itemQty = typeof item.qty === "number" && !isNaN(item.qty) && item.qty > 0 ? item.qty : 1
      return total + itemPrice * itemQty
    }, 0)
    return isNaN(subtotal) ? 0 : subtotal
  }

  const calculateTip = () => {
    const subtotal = calculateSubtotal()
    let tip = 0

    if (selectedTip === -1) {
      const customAmount = Number.parseFloat(customTipAmount) || 0
      tip = Math.max(0, customAmount)
    } else {
      tip = subtotal * selectedTip
    }

    return isNaN(tip) ? 0 : tip
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tip = calculateTip()
    const total = subtotal + tip
    return isNaN(total) ? 0 : total
  }

  const handleEditItem = (item: CartItem, index: number) => {
    const menuDish = menu.find((dish) => dish.id === item.id)
    if (menuDish) {
      setEditingItem({ item, index })
    }
  }

  const handleUpdateItem = (updatedItem: CartItem) => {
    if (editingItem) {
      setCart((prev) => {
        const updated = [...prev]
        const originalItem = updated[editingItem.index]
        updated[editingItem.index] = {
          ...originalItem,
          ...updatedItem,
          qty: updatedItem.qty || originalItem.qty || 1,
          img: updatedItem.img || originalItem.img,
        }
        return updated
      })
      setEditingItem(null)
    }
  }

  const updateItemNote = (index: number, note: string) => {
    setCart((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        note: note || undefined,
      }
      return updated
    })
    setShowNoteInput(null)
  }

  const handleConfirmOrder = async () => {
    if (!isOnline) {
      const offlineMessage =
        t("networkErrorDesc") ||
        (language === "es"
          ? "No hay conexión a internet. Verifica tu WiFi o datos móviles."
          : "No internet connection. Check your WiFi or mobile data.")
      alert(offlineMessage)
      return
    }

    setIsSending(true)
    try {
      console.log("[v0] OrderReview: Starting order submission")
      console.log("[v0] OrderReview: Token:", token ? "present" : "missing")
      console.log("[v0] OrderReview: OrderType:", orderType)
      console.log("[v0] OrderReview: Table:", tableNumber)
      console.log("[v0] OrderReview: Cart items:", cart.length)

      const subtotal = calculateSubtotal()
      const tipAmount = calculateTip()
      const total = calculateTotal()

      console.log("[v0] OrderReview: Calculated totals:", { subtotal, tipAmount, total })

      const gasCart = cart.map((item, index) => {
        let unitPrice = 0
        if (typeof item.unitPrice === "number" && !isNaN(item.unitPrice)) {
          unitPrice = item.unitPrice
        } else {
          unitPrice = item.price || 0

          if (item.variantName) {
            const menuDish = menu.find((dish) => dish.id === item.id)
            const variant = menuDish?.variants?.find((v) => v.name === item.variantName)
            if (variant) {
              unitPrice += variant.price || 0
            }
          }

          if (item.persos && item.persos.length > 0) {
            const persosPrice = item.persos.reduce((sum, perso) => sum + (perso.price || 0), 0)
            unitPrice += persosPrice
          }
        }

        const priceArray: [string, number][] = [[item.name, item.price || 0]]

        if (item.persos && item.persos.length > 0) {
          item.persos.forEach((perso) => {
            priceArray.push([perso.name, perso.price])
          })
        }

        return {
          id: item.id,
          v: item.variantName || "",
          q: item.qty,
          p: priceArray,
          unitPrice: unitPrice,
          note: item.note || "",
        }
      })

      console.log("[v0] OrderReview: Formatted cart:", JSON.stringify(gasCart, null, 2))

      const orderPayload = {
        cart: gasCart,
        totalClient: total,
        tip: tipAmount,
        meta: {
          locale: language === "es" ? "es-ES" : "en-US",
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
          ua: navigator.userAgent,
          table: tableNumber,
          token: token || undefined,
          order_type: orderType,
          subtotal: subtotal,
          tipAmount: tipAmount,
        },
      }

      console.log("[v0] OrderReview: Submitting order payload:", JSON.stringify(orderPayload, null, 2))

      const result = await createOrder(orderPayload)

      console.log("[v0] OrderReview: API response:", result)

      if (!result.ok) {
        console.error("[v0] OrderReview: Order creation failed:", result.message)
        throw new Error(result.message || "Failed to create order")
      }

      console.log("[v0] OrderReview: Order saved successfully:", result.orderId)

      const orderIdToSend = result.orderId
      const totalToSend = result.serverTotal || total
      const tipToSend = tipAmount

      setCart([])
      setSelectedTip(0)
      setCustomTipAmount("")

      setOrderSuccess({
        orderId: orderIdToSend,
        total: totalToSend,
        tip: tipToSend,
      })
    } catch (error) {
      console.error("[v0] OrderReview: Error submitting order:", error)
      console.error("[v0] OrderReview: Error stack:", error instanceof Error ? error.stack : "No stack trace")

      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      console.log("[v0] OrderReview: Checking error message:", errorMessage)

      let userMessage = t("orderError") || (language === "es" ? "Error al enviar el pedido" : "Error sending order")

      if (isNetworkError(error)) {
        console.log("[v0] OrderReview: Detected network error")
        userMessage =
          t("networkErrorDesc") ||
          (language === "es"
            ? "No hay conexión a internet. Verifica tu WiFi o datos móviles."
            : "No internet connection. Check your WiFi or mobile data.")
      } else if (
        errorMessage.includes("Mesa no encontrada") ||
        errorMessage.includes("Table not found") ||
        errorMessage.includes("Mesa requerida") ||
        errorMessage.includes("Table required") ||
        errorMessage.includes("mesa válida") ||
        errorMessage.includes("valid table")
      ) {
        console.log("[v0] OrderReview: Detected table-related error")
        userMessage =
          t("tableNotFoundDesc") ||
          (language === "es"
            ? "Estimado/a usuario, su solicitud no puede ser procesada. Por favor, consulte con el personal del restaurante."
            : "Dear user, your request cannot be processed. Please consult with the restaurant staff.")
      } else {
        console.log("[v0] OrderReview: Generic error, showing default message")
      }

      console.log("[v0] OrderReview: Displaying error to user:", userMessage)
      alert(userMessage)
    } finally {
      setIsSending(false)
      console.log("[v0] OrderReview: Order submission completed")
    }
  }

  const handleSendViaWhatsApp = () => {
    if (!orderSuccess) return

    const enableOrderSend = process.env.NEXT_PUBLIC_WA_ENABLE_ORDER_SEND !== "false"

    if (enableOrderSend) {
      console.log("[v0] OrderReview: Opening WhatsApp with order:", orderSuccess.orderId)
      openWhatsApp({
        orderId: orderSuccess.orderId,
        total: orderSuccess.total,
        tip: orderSuccess.tip,
      })
    }

    setOrderSuccess(null)
    setTimeout(() => {
      onBack()
    }, 100)
  }

  const handleContinueWithoutWhatsApp = () => {
    setOrderSuccess(null)
    setTimeout(() => {
      onBack()
    }, 100)
  }

  const handleSimpleConfirmation = () => {
    setOrderSuccess(null)
    setTimeout(() => {
      onBack()
    }, 100)
  }

  if (editingItem) {
    const menuDish = menu.find((dish) => dish.id === editingItem.item.id)
    if (menuDish) {
      return (
        <DishModal
          dish={menuDish}
          language={language}
          onClose={() => setEditingItem(null)}
          onAddToCart={(dish, quantity, variant, personalizations, notes) => {
            const updatedItem: CartItem = {
              ...editingItem.item,
              qty: quantity,
              variantName: variant,
              persos: personalizations || [],
              note: notes,
              unitPrice:
                dish.price +
                ((variant && menuDish.variants?.find((v) => v.name === variant)?.price) || 0) +
                (personalizations?.reduce((sum, p) => sum + (p.free ? 0 : p.price), 0) || 0),
            }
            handleUpdateItem(updatedItem)
          }}
          editingItem={editingItem.item}
        />
      )
    }
  }

  if (orderSuccess) {
    const enableOrderSend = process.env.NEXT_PUBLIC_WA_ENABLE_ORDER_SEND !== "false"

    if (!enableOrderSend) {
      return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-6 space-y-6">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Success Message */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">{t("orderSuccessTitle")}</h2>
                <p className="text-gray-600">{t("orderSuccessMessage")}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                  <span className="text-sm text-gray-600">{t("orderId")}:</span>
                  <span className="text-sm font-mono font-semibold text-gray-900">{orderSuccess.orderId}</span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleSimpleConfirmation}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl h-12 shadow-lg"
              >
                {t("continue")}
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="p-6 space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">{t("orderSuccessTitle")}</h2>
              <p className="text-gray-600">{t("orderSuccessMessage")}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                <span className="text-sm text-gray-600">{t("orderId")}:</span>
                <span className="text-sm font-mono font-semibold text-gray-900">{orderSuccess.orderId}</span>
              </div>
            </div>

            {/* WhatsApp Benefits */}
            <div className="space-y-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
              <h3 className="font-semibold text-gray-900 text-center">{t("whatsappBenefitsTitle")}</h3>
              <p className="text-sm text-gray-700 text-center">{t("whatsappBenefitsDesc")}</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">{t("whatsappBenefit1")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">{t("whatsappBenefit2")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">{t("whatsappBenefit3")}</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleSendViaWhatsApp}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl h-12 shadow-lg"
              >
                {t("sendViaWhatsApp")}
              </Button>
              <Button
                onClick={handleContinueWithoutWhatsApp}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl bg-transparent"
              >
                {t("noThanks")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
      <div className="border-b border-gray-100 p-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{t("reviewOrder")}</h1>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {(cart || []).map((item, index) => {
          const itemKey = `${item.id}-${index}`
          return (
            <Card key={itemKey} className="shadow-sm border-gray-100 rounded-2xl">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.img || "/placeholder.svg?height=80&width=80"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <Badge variant="secondary" className="bg-orange-50 text-orange-600 text-xs">
                          {translateCategory(item.category, language)}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowNoteInput(showNoteInput === itemKey ? null : itemKey)}
                          className={`h-8 w-8 ${item.note ? "text-orange-500 bg-orange-50" : "text-gray-500 hover:text-orange-500 hover:bg-orange-50"}`}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditItem(item, index)}
                          className="h-8 w-8 text-gray-500 hover:text-orange-500 hover:bg-orange-50"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {item.variantName && (
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs rounded-full">
                          {item.variantName}
                        </Badge>
                      </div>
                    )}

                    {item.persos && item.persos.length > 0 && (
                      <div className="mb-2 space-y-1">
                        {item.persos.map((perso, i) => (
                          <div key={i} className="text-xs text-gray-600 flex justify-between items-center">
                            <span className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></span>
                              <span className="font-medium">{perso.name}</span>
                            </span>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                perso.free ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {perso.free ? t("free") : moneyEUR(perso.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {item.note && showNoteInput !== itemKey && (
                      <div className="mb-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                        <p className="text-xs text-amber-800 italic flex items-start gap-2">
                          <span className="text-amber-500 text-sm">💭</span>
                          <span className="flex-1 min-w-0 overflow-hidden">
                            <span className="block truncate max-w-full">
                              {item.note.length > 50 ? (
                                <>
                                  {item.note.substring(0, 50)}...
                                  <button
                                    onClick={() => setShowNoteInput(itemKey)}
                                    className="ml-1 text-amber-600 hover:text-amber-700 underline font-medium"
                                  >
                                    {t("readMore")}
                                  </button>
                                </>
                              ) : (
                                item.note
                              )}
                            </span>
                          </span>
                        </p>
                      </div>
                    )}

                    {showNoteInput === itemKey && (
                      <div className="mb-3 space-y-3 p-3 bg-white border-2 border-orange-200 rounded-xl shadow-sm">
                        <Textarea
                          placeholder={t("addSpecialNote")}
                          value={item.note || ""}
                          onChange={(e) => {
                            const newNote = e.target.value
                            setCart((prev) => {
                              const updated = [...prev]
                              updated[index] = {
                                ...updated[index],
                                note: newNote || undefined,
                              }
                              return updated
                            })
                          }}
                          className="w-full text-sm resize-none h-24 border-orange-200 focus:border-orange-400 focus:ring-orange-200 rounded-lg"
                          maxLength={200}
                          style={{
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                            whiteSpace: "pre-wrap",
                            minWidth: "0",
                            maxWidth: "100%",
                          }}
                        />
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{t("maxCharacters")}: 200</span>
                          <span className={(item.note || "").length > 180 ? "text-orange-600 font-medium" : ""}>
                            {(item.note || "").length}/200
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setShowNoteInput(null)}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs h-8 px-4 rounded-lg shadow-sm"
                          >
                            {t("save")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Restore original note if canceling
                              setShowNoteInput(null)
                            }}
                            className="text-xs h-8 px-4 border-gray-300 hover:bg-gray-50 rounded-lg"
                          >
                            {t("cancel")}
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-lg border-gray-200 bg-transparent"
                          onClick={() => updateQuantity(index, item.qty - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{item.qty}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-lg border-gray-200 bg-transparent"
                          onClick={() => updateQuantity(index, item.qty + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-sm font-bold text-gray-900">
                          {(() => {
                            let itemPrice = 0
                            if (typeof item.unitPrice === "number" && !isNaN(item.unitPrice)) {
                              itemPrice = item.unitPrice
                            } else {
                              itemPrice = item.price || 0
                              if (item.persos && item.persos.length > 0) {
                                const persosPrice = item.persos.reduce((sum, perso) => sum + (perso.price || 0), 0)
                                itemPrice += persosPrice
                              }
                            }
                            const itemQty =
                              typeof item.qty === "number" && !isNaN(item.qty) && item.qty > 0 ? item.qty : 1
                            return moneyEUR(itemPrice * itemQty)
                          })()}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="border-t border-gray-100 p-4 pb-safe space-y-4 bg-white flex-shrink-0">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">{t("addTip")}</h3>
          <div className="grid grid-cols-3 gap-2">
            {tipOptions.map((tip) => (
              <Button
                key={tip.value}
                variant={selectedTip === tip.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedTip(tip.value)
                  if (tip.value !== -1) {
                    setCustomTipAmount("")
                  }
                }}
                className={`text-xs min-h-[2.5rem] h-auto py-2 px-2 rounded-lg whitespace-normal leading-tight ${
                  selectedTip === tip.value
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tip.label}
              </Button>
            ))}
          </div>

          {selectedTip === -1 && (
            <div className="mt-3">
              <Input
                type="number"
                placeholder={t("enterCustomAmount")}
                value={customTipAmount}
                onChange={(e) => setCustomTipAmount(e.target.value)}
                className="text-sm h-10 rounded-lg border-orange-200 focus:border-orange-400 focus:ring-orange-200"
                min="0"
                step="0.01"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">{t("subtotal")}</span>
            <span className="text-gray-900">{moneyEUR(calculateSubtotal())}</span>
          </div>
          {(selectedTip > 0 || (selectedTip === -1 && Number.parseFloat(customTipAmount) > 0)) && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {selectedTip === -1
                  ? t("tip") + ` (${t("customTip")})`
                  : `${t("tip")} (${Math.round(selectedTip * 100)}%)`}
              </span>
              <span className="text-gray-900">{moneyEUR(calculateTip())}</span>
            </div>
          )}
          <div className="flex justify-between items-center border-t border-gray-100 pt-2 px-4">
            <span className="text-lg font-semibold text-gray-900">{t("total")}</span>
            <span className="text-2xl font-bold text-gray-900">{moneyEUR(calculateTotal())}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={clearCart}
            className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl bg-transparent"
            disabled={isSending}
          >
            {t("clearCart")}
          </Button>
          <Button
            onClick={handleConfirmOrder}
            disabled={isSending}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl disabled:opacity-50"
          >
            {isSending ? t("sending") : t("confirmAndSend")}
          </Button>
        </div>
      </div>
    </div>
  )
}
