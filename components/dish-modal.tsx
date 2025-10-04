"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Minus, Plus, Edit3 } from "lucide-react"
import { useI18n, translateAllergen } from "@/lib/i18n"
import { moneyEUR } from "@/lib/money"
import DishImageCarousel from "@/components/dish-image-carousel"
import type { MenuDish, CartItem } from "@/types/menu"
import { useToast } from "@/hooks/use-toast"

interface DishModalProps {
  dish: MenuDish
  language: "es" | "en"
  onClose: () => void
  onAddToCart: (
    dish: MenuDish,
    quantity: number,
    variant?: string,
    personalizations?: Array<{ name: string; price: number; free?: boolean }>,
    notes?: string,
  ) => void
  editingItem?: CartItem // Added optional editing item prop
}

export default function DishModal({ dish, language, onClose, onAddToCart, editingItem }: DishModalProps) {
  const [quantity, setQuantity] = useState(editingItem?.qty || 1)
  const [notes, setNotes] = useState(editingItem?.note || "")
  const [showNotes, setShowNotes] = useState(Boolean(editingItem?.note))
  const [selectedVariant, setSelectedVariant] = useState<string>(editingItem?.variantName || "")
  const [selectedPersonalizations, setSelectedPersonalizations] = useState<
    Array<{ name: string; price: number; free?: boolean }>
  >(editingItem?.persos || [])
  const { t } = useI18n(language)
  const { toast } = useToast()

  const calculatePrice = () => {
    let price = dish.price

    // Add variant price
    if (selectedVariant && dish.variants) {
      const variant = dish.variants.find((v) => v.name === selectedVariant)
      if (variant && variant.price) {
        price += variant.price
      }
    }

    // Add personalizations price (only non-free ones)
    selectedPersonalizations.forEach((perso) => {
      if (!perso.free) {
        price += perso.price
      }
    })

    return price * quantity
  }

  const handleAddToCart = () => {
    onAddToCart(dish, quantity, selectedVariant || undefined, selectedPersonalizations, notes || undefined)

    onClose()
  }

  const togglePersonalization = (perso: { name: string; price?: number; free?: boolean }) => {
    const personalization = {
      name: perso.name,
      price: perso.price || 0,
      free: perso.free || false,
    }

    setSelectedPersonalizations((prev) => {
      const exists = prev.find((p) => p.name === perso.name)
      if (exists) {
        return prev.filter((p) => p.name !== perso.name)
      } else {
        return [...prev, personalization]
      }
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className="w-screen max-w-none m-0 rounded-none flex flex-col bg-white border-gray-100 p-6"
        style={{ height: "100dvh", maxHeight: "100dvh" }}
      >
        <DialogHeader className="pb-4 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-gray-900 pr-8">
            {editingItem ? t("editItem") : dish.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6" style={{ minWidth: "0", width: "100%" }}>
          <div className="w-full h-80 rounded-2xl overflow-hidden bg-gray-50">
            {dish.images.gallery && dish.images.gallery.length > 1 ? (
              <DishImageCarousel
                images={dish.images.gallery}
                alt={dish.name}
                className="w-full h-full"
                autoScrollInterval={4000}
              />
            ) : (
              <img
                src={dish.images.main || "/placeholder.svg?height=320&width=600"}
                alt={dish.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {editingItem && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{dish.name}</h2>
            </div>
          )}

          <div>
            <p className="text-gray-700 leading-relaxed text-base">{dish.description}</p>
          </div>

          {dish.allergens && dish.allergens.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">{t("allergens")}</h3>
              <p className="text-gray-600 text-sm">
                {t("allergens")}: {dish.allergens.map((allergen) => translateAllergen(allergen, language)).join(", ")}
              </p>
            </div>
          )}

          {dish.variants && dish.variants.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">{t("variants")}</h3>
              <div className="flex flex-wrap gap-2">
                {dish.variants.map((variant) => (
                  <Button
                    key={variant.name}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedVariant(variant.name === selectedVariant ? "" : variant.name)}
                    className={`rounded-full px-4 py-2 transition-all ${
                      selectedVariant === variant.name
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    {variant.name}
                    {variant.price && variant.price > 0 && <span className="ml-1">+{moneyEUR(variant.price)}</span>}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {dish.personalizations && dish.personalizations.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <span className="text-orange-500">⚙️</span>
                {t("personalizations")}
              </h3>
              <div className="space-y-3">
                {dish.personalizations.map((perso) => {
                  const isSelected = selectedPersonalizations.some((p) => p.name === perso.name)
                  return (
                    <div
                      key={perso.name}
                      onClick={() => togglePersonalization(perso)}
                      className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                        isSelected
                          ? "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 shadow-md scale-[1.02]"
                          : "bg-gray-50 hover:bg-gradient-to-r hover:from-gray-100 hover:to-slate-100 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <span className="text-gray-900 font-medium flex items-center gap-2">
                        {isSelected && <span className="text-orange-500">✓</span>}
                        {perso.name}
                      </span>
                      <span
                        className={`text-sm font-bold px-3 py-1 rounded-full ${
                          perso.free
                            ? "bg-green-100 text-green-700"
                            : isSelected
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {perso.free ? t("free") : `+ ${moneyEUR(perso.price || 0)}`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-3 text-gray-900">{t("quantity")}</h3>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-12 w-12 rounded-xl border-gray-200"
              >
                <Minus className="h-5 w-5" />
              </Button>
              <span className="text-2xl font-bold w-16 text-center text-gray-900">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-12 w-12 rounded-xl border-gray-200"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div>
            <Button
              variant="ghost"
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 p-0"
            >
              <Edit3 className="h-4 w-4" />
              {showNotes ? t("hideNotes") : t("addNotes")}
            </Button>

            {showNotes && (
              <div
                className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 overflow-hidden"
                style={{ minWidth: "0", width: "100%" }}
              >
                <Textarea
                  placeholder={t("notesPlaceholder")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  maxLength={200}
                  className="w-full rounded-xl border-amber-300 focus:border-orange-400 focus:ring-orange-200 bg-white/70 backdrop-blur-sm resize-none overflow-hidden"
                  style={{
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "pre-wrap",
                    minWidth: "0",
                    maxWidth: "100%",
                    width: "100%",
                    resize: "none",
                    overflow: "hidden",
                    boxSizing: "border-box",
                    display: "block",
                    flex: "none",
                  }}
                />
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>{t("maxCharacters")}: 200</span>
                  <span className={notes.length > 180 ? "text-orange-600 font-medium" : ""}>{notes.length}/200</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">{t("total")}</p>
              <p className="text-3xl font-bold text-gray-900">{moneyEUR(calculatePrice())}</p>
            </div>
            <Button
              onClick={(e) => {
                const button = e.currentTarget
                button.classList.add("animate-pulse", "bg-orange-500", "shadow-lg")
                setTimeout(() => {
                  button.classList.remove("animate-pulse", "bg-orange-500", "shadow-lg")
                }, 300)
                handleAddToCart()
              }}
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-xl h-auto transition-all duration-200 active:scale-95"
            >
              {editingItem ? t("updateItem") : t("addToCart")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
