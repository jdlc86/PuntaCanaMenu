"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react"
import { useI18n, translateCategory } from "@/lib/i18n"
import { moneyEUR } from "@/lib/money"
import type { MenuDish } from "@/types/menu"
import { useCart } from "@/lib/cart-context"
import { useTable } from "@/lib/table-context"
import OrderReview from "@/components/order-review"

interface FloatingCartProps {
  language: "es" | "en"
  tableNumber: string
  menu: MenuDish[]
}

export default function FloatingCart({ language, tableNumber, menu }: FloatingCartProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showOrderReview, setShowOrderReview] = useState(false)
  const { t } = useI18n(language)
  const { cart, updateQuantity, removeItem, clearCart, totalItems, subtotal, setCart } = useCart()
  const { token, orderType } = useTable()

  console.log("[v0] FloatingCart: totalItems:", totalItems)
  console.log("[v0] FloatingCart: Rendering cart button")

  if (showOrderReview) {
    return (
      <OrderReview
        cart={cart}
        setCart={setCart}
        language={language}
        tableNumber={tableNumber}
        menu={menu}
        onBack={() => setShowOrderReview(false)}
        token={token}
        orderType={orderType}
      />
    )
  }

  if (totalItems === 0) {
    console.log("[v0] FloatingCart: No items in cart, not rendering")
    return null
  }

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 p-4 pb-safe md:hidden"
        style={{
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          paddingTop: "1rem",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          minHeight: "calc(5rem + env(safe-area-inset-bottom))",
        }}
      >
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl h-14 flex items-center justify-between px-6"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5" />
                <span>{t("viewCart")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-orange-500 text-white">{totalItems}</Badge>
                <span className="font-bold">{moneyEUR(subtotal)}</span>
              </div>
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-full bg-white border-gray-100">
            <SheetHeader className="pb-6">
              <SheetTitle className="text-2xl font-bold text-gray-900">{t("cart")}</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col h-[calc(100vh-120px)]">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {cart.map((item, index) => (
                  <Card key={`${item.id}-${index}`} className="shadow-sm border-gray-100 rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Mini photo */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={item.img || "/placeholder.svg?height=64&width=64"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Name and category */}
                          <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                          <Badge variant="secondary" className="mb-2 bg-orange-50 text-orange-600 text-xs">
                            {translateCategory(item.category, language)}
                          </Badge>

                          {/* Variant */}
                          {item.variantName && (
                            <div className="mb-2">
                              <Badge variant="outline" className="text-xs rounded-full">
                                {item.variantName}
                              </Badge>
                            </div>
                          )}

                          {/* Personalizations */}
                          {item.persos && item.persos.length > 0 && (
                            <div className="mb-2 space-y-1">
                              {item.persos.map((perso, i) => (
                                <div key={i} className="text-xs text-gray-600 flex justify-between items-center">
                                  <span className="flex items-center gap-1">
                                    <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
                                    {perso.name}
                                  </span>
                                  <span className={`font-medium ${perso.free ? "text-green-600" : "text-gray-700"}`}>
                                    {perso.free ? `(${t("free")})` : moneyEUR(perso.price)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Note */}
                          {item.note && (
                            <div className="mb-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                              <p className="text-xs text-amber-700 italic line-clamp-2 flex items-start gap-1">
                                <span className="text-amber-500 mt-0.5">💬</span>"{item.note}"
                              </p>
                            </div>
                          )}

                          {/* Quantity controls and price */}
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

                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-gray-900">
                                {moneyEUR(
                                  (typeof item.unitPrice === "number" && !isNaN(item.unitPrice) ? item.unitPrice : 0) *
                                    (typeof item.qty === "number" && !isNaN(item.qty) ? item.qty : 1),
                                )}
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
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6 pb-safe space-y-4 flex-shrink-0">
                <div className="flex justify-between items-center px-4">
                  <span className="text-lg font-semibold text-gray-900">{t("total")}</span>
                  <span className="text-2xl font-bold text-gray-900">{moneyEUR(subtotal)}</span>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl bg-transparent"
                  >
                    {t("clearCart")}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsOpen(false)
                      setShowOrderReview(true)
                    }}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl"
                  >
                    {t("reviewOrder")}
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="fixed bottom-6 right-6 z-50 hidden md:block">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="rounded-full shadow-lg bg-gray-900 hover:bg-gray-800 text-white relative px-6 py-3"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {t("cart")}
              <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white border-2 border-white">
                {totalItems}
              </Badge>
            </Button>
          </SheetTrigger>
          {/* Same SheetContent as mobile */}
          <SheetContent side="right" className="w-full bg-white border-gray-100">
            <SheetHeader className="pb-6">
              <SheetTitle className="text-2xl font-bold text-gray-900">{t("cart")}</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col h-[calc(100vh-120px)]">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {cart.map((item, index) => (
                  <Card key={`${item.id}-${index}`} className="shadow-sm border-gray-100 rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Mini photo */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={item.img || "/placeholder.svg?height=64&width=64"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Name and category */}
                          <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                          <Badge variant="secondary" className="mb-2 bg-orange-50 text-orange-600 text-xs">
                            {translateCategory(item.category, language)}
                          </Badge>

                          {/* Variant */}
                          {item.variantName && (
                            <div className="mb-2">
                              <Badge variant="outline" className="text-xs rounded-full">
                                {item.variantName}
                              </Badge>
                            </div>
                          )}

                          {/* Personalizations */}
                          {item.persos && item.persos.length > 0 && (
                            <div className="mb-2 space-y-1">
                              {item.persos.map((perso, i) => (
                                <div key={i} className="text-xs text-gray-600 flex justify-between items-center">
                                  <span className="flex items-center gap-1">
                                    <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
                                    {perso.name}
                                  </span>
                                  <span className={`font-medium ${perso.free ? "text-green-600" : "text-gray-700"}`}>
                                    {perso.free ? `(${t("free")})` : moneyEUR(perso.price)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Note */}
                          {item.note && (
                            <div className="mb-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                              <p className="text-xs text-amber-700 italic line-clamp-2 flex items-start gap-1">
                                <span className="text-amber-500 mt-0.5">💬</span>"{item.note}"
                              </p>
                            </div>
                          )}

                          {/* Quantity controls and price */}
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

                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-gray-900">
                                {moneyEUR(
                                  (typeof item.unitPrice === "number" && !isNaN(item.unitPrice) ? item.unitPrice : 0) *
                                    (typeof item.qty === "number" && !isNaN(item.qty) ? item.qty : 1),
                                )}
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
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-4 flex-shrink-0">
                <div className="flex justify-between items-center px-4">
                  <span className="text-lg font-semibold text-gray-900">{t("total")}</span>
                  <span className="text-2xl font-bold text-gray-900">{moneyEUR(subtotal)}</span>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl bg-transparent"
                  >
                    {t("clearCart")}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsOpen(false)
                      setShowOrderReview(true)
                    }}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl"
                  >
                    {t("reviewOrder")}
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
