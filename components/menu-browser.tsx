"use client"

import type React from "react"

import { useState, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  UtensilsCrossed,
  ArrowLeft,
  Info,
  HandPlatter as HandRaised,
  Receipt,
  Star,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  Languages,
  X,
} from "lucide-react"
import DishModal from "@/components/dish-modal"
import FloatingCart from "@/components/floating-cart"
import StarRating from "@/components/star-rating"
import { useI18n, translateAllergen, translateCategory, t } from "@/lib/i18n"
import { moneyEUR } from "@/lib/money"
import DishImageCarousel from "@/components/dish-image-carousel"
import type { MenuDish } from "@/types/menu"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/lib/cart-context"
import { useMenu } from "@/lib/useMenu"
import { useTable } from "@/lib/table-context"
import { useOnlineStatus, isNetworkError } from "@/hooks/use-online-status"
import SessionTimer from "@/components/session-timer"
import PushNotificationToggle from "@/components/push-notification-toggle"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRestaurantConfigContext } from "@/lib/restaurant-config-context"

interface MenuBrowserProps {
  tableNumber: string
  language: "es" | "en" | "de" | "fr" | "zh"
  onBackToHome?: () => void
  dishes: MenuDish[]
  onLanguageChange?: (lang: "es" | "en" | "de" | "fr" | "zh") => void // Added prop for language change
}

const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

const normalizeCategory = (category: string) => {
  const normalized = normalizeText(category)
  // Remove trailing 's' to handle singular/plural variations
  return normalized.endsWith("s") ? normalized.slice(0, -1) : normalized
}

export default function MenuBrowser({
  tableNumber,
  language,
  onBackToHome,
  dishes: propDishes,
  onLanguageChange,
}: MenuBrowserProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDish, setSelectedDish] = useState<MenuDish | null>(null)
  const [showStarRating, setShowStarRating] = useState(false)
  const [waiterButtonPulsing, setWaiterButtonPulsing] = useState(false)
  const [billButtonPulsing, setBillButtonPulsing] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [showWaiterConfirm, setShowWaiterConfirm] = useState(false)
  const [showBillConfirm, setShowBillConfirm] = useState(false)
  const [showLoadingError, setShowLoadingError] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false) // Added state for search expansion

  const { dishes: dbDishes, loading: isLoading, connected: connectionStatus, refetch } = useMenu(language)
  const { orderType } = useTable()

  const isOnline = useOnlineStatus()

  const dishes = dbDishes.length > 0 ? dbDishes : propDishes
  const isUsingDefaultDish = dbDishes.length === 0

  const isSystemWorking = !isLoading && dishes.length > 0

  console.log("[v0] MenuBrowser: orderType from context:", orderType)
  console.log("[v0] MenuBrowser: isOnlineOrder calculated:", orderType === "O")

  console.log("[v0] MenuBrowser: dbDishes length:", dbDishes.length)
  console.log("[v0] MenuBrowser: propDishes length:", propDishes.length)
  console.log("[v0] MenuBrowser: Using dishes length:", dishes.length)
  console.log("[v0] MenuBrowser: Final dishes:", dishes)

  const { cart, addToCart: addToCartContext } = useCart()
  const { t: tFunc } = useI18n(language)
  const categoryScrollRef = useRef<HTMLDivElement>(null)
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const { toast } = useToast()
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null) // Added ref for auto-close timer

  const categories = useMemo(() => {
    // Get unique categories from dishes
    const uniqueCategories = Array.from(new Set(dishes.map((dish) => normalizeCategory(dish.category))))

    // Create category objects with labels
    const dynamicCategories = uniqueCategories.map((categoryId) => {
      const label = translateCategory(categoryId, language)
      return {
        id: categoryId,
        label: label.charAt(0).toUpperCase() + label.slice(1),
      }
    })

    // Always include "all" as the first option
    return [{ id: "all", label: tFunc("categories.all") }, ...dynamicCategories]
  }, [dishes, language])

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const normalizedSearchTerm = normalizeText(searchTerm)
      const matchesSearch =
        normalizeText(dish.name).includes(normalizedSearchTerm) ||
        normalizeText(dish.description).includes(normalizedSearchTerm)

      const matchesCategory =
        selectedCategory === "all" || normalizeCategory(dish.category) === normalizeCategory(selectedCategory)

      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory, dishes])

  const dishesByCategory = useMemo(() => {
    const grouped: { [key: string]: MenuDish[] } = {}

    if (selectedCategory === "all") {
      categories.forEach((cat) => {
        if (cat.id !== "all") {
          const categoryDishes = filteredDishes.filter(
            (dish) => normalizeCategory(dish.category) === normalizeCategory(cat.id),
          )
          grouped[cat.id] = categoryDishes.sort((a, b) => {
            if (a.estrella && !b.estrella) return -1
            if (!a.estrella && b.estrella) return 1
            return 0
          })
        }
      })
    } else {
      grouped[selectedCategory] = filteredDishes.sort((a, b) => {
        if (a.estrella && !b.estrella) return -1
        if (!a.estrella && b.estrella) return 1
        return 0
      })
    }

    return grouped
  }, [selectedCategory, filteredDishes, dishes])

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)

    if (categoryId !== "all" && categoryRefs.current[categoryId]) {
      setTimeout(() => {
        categoryRefs.current[categoryId]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 100)
    }
  }

  const addToCart = (
    dish: MenuDish,
    quantity = 1,
    variant?: string,
    personalizations: Array<{ name: string; price: number; free?: boolean }> = [],
    notes?: string,
  ) => {
    addToCartContext(dish, quantity, variant, personalizations, notes)

    const basePrice = dish.price
    const variantPrice = variant && dish.variants ? dish.variants.find((v) => v.name === variant)?.price || 0 : 0
    const persosPrice = personalizations.reduce((sum, p) => sum + (p.free ? 0 : p.price), 0)
    const unitPrice = basePrice + variantPrice + persosPrice

    toast({
      title: "✅ " + tFunc("addedToCart"),
      description: `${dish.name} ${quantity > 1 ? `(${quantity})` : ""} - ${moneyEUR(unitPrice * quantity)}`,
      duration: 2000,
    })
  }

  function normalizePhone(raw: string, countryCode = "34"): string {
    if (!raw) {
      console.log("[v0] normalizePhone: Empty phone number provided")
      return ""
    }

    console.log("[v0] normalizePhone: Input:", raw, "Country code:", countryCode)

    let d = raw.replace(/\D+/g, "")

    if (d.startsWith("00")) d = d.slice(2)
    if (d.startsWith("0") && !d.startsWith("00")) d = d.slice(1)
    if (!d.startsWith(countryCode)) d = countryCode + d

    console.log("[v0] normalizePhone: Output:", d)
    return d
  }

  const openWhatsAppInfo = (dish: MenuDish) => {
    console.log("[v0] openWhatsAppInfo: Called for dish:", dish.name)

    const envPhone = process.env.NEXT_PUBLIC_WA_PHONE
    const defaultPhone = "34600000000"

    console.log("[v0] openWhatsAppInfo: NEXT_PUBLIC_WA_PHONE env var:", envPhone)
    console.log("[v0] openWhatsAppInfo: Default phone:", defaultPhone)

    const rawPhone = envPhone || defaultPhone
    const phone = normalizePhone(rawPhone, "34")

    console.log("[v0] openWhatsAppInfo: Final phone number:", phone)

    const allergensList =
      dish.allergens && dish.allergens.length > 0
        ? dish.allergens.map((a) => translateAllergen(a, language)).join(", ")
        : tFunc("none")

    const message = `${tFunc("needMoreInfoAbout")} ${dish.name}. ${dish.description}. ${tFunc("allergens")}: ${allergensList}`

    console.log("[v0] openWhatsAppInfo: Message:", message)

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

    console.log("[v0] openWhatsAppInfo: WhatsApp URL:", whatsappUrl)

    if (typeof window !== "undefined") {
      try {
        const opened = window.open(whatsappUrl, "_blank")
        if (!opened) {
          console.log("[v0] openWhatsAppInfo: Popup blocked, trying location.href")
          window.location.href = whatsappUrl
        } else {
          console.log("[v0] openWhatsAppInfo: WhatsApp opened successfully")
        }
      } catch (error) {
        console.error("[v0] openWhatsAppInfo: Error opening WhatsApp:", error)
        toast({
          title: "❌ Error",
          description: "No se pudo abrir WhatsApp. Por favor, inténtalo de nuevo.",
          duration: 3000,
        })
      }
    }
  }

  const callWaiter = async () => {
    if (!isOnline) {
      toast({
        title: "❌ " + t(language, "networkError"),
        description: t(language, "callWaiterErrorOffline"),
        duration: 4000,
      })
      return
    }

    if (waiterButtonPulsing) return

    setWaiterButtonPulsing(true)

    try {
      const response = await fetch("/api/service-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "call_waiter",
          tableNumber,
          language: language.toUpperCase(),
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        toast({
          title: "✋ " + tFunc("callWaiter"),
          description: "El camarero ha sido notificado",
          duration: 3000,
        })
      } else {
        throw new Error("Failed to call waiter")
      }
    } catch (error) {
      console.error("Error calling waiter:", error)
      const isNetwork = isNetworkError(error)
      toast({
        title: "❌ " + t(language, isNetwork ? "networkError" : "callWaiterError"),
        description: isNetwork ? t(language, "callWaiterErrorOffline") : t(language, "callWaiterError"),
        duration: 4000,
      })
    }

    setTimeout(() => {
      setWaiterButtonPulsing(false)
    }, 10000)
  }

  const requestBill = async () => {
    if (!isOnline) {
      toast({
        title: "❌ " + t(language, "networkError"),
        description: t(language, "requestBillErrorOffline"),
        duration: 4000,
      })
      return
    }

    if (billButtonPulsing) return

    setBillButtonPulsing(true)

    try {
      const response = await fetch("/api/service-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "request_bill",
          tableNumber,
          language: language.toUpperCase(),
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        toast({
          title: "🧾 " + tFunc("requestBill"),
          description: "La cuenta ha sido solicitada",
          duration: 3000,
        })
      } else {
        throw new Error("Failed to request bill")
      }
    } catch (error) {
      console.error("Error requesting bill:", error)
      const isNetwork = isNetworkError(error)
      toast({
        title: "❌ " + t(language, isNetwork ? "networkError" : "requestBillError"),
        description: isNetwork ? t(language, "requestBillErrorOffline") : t(language, "requestBillError"),
        duration: 4000,
      })
    }

    setTimeout(() => {
      setBillButtonPulsing(false)
    }, 10000)
  }

  const rateService = () => {
    setShowStarRating(true)
  }

  const toggleExpandCard = (dishId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(dishId)) {
        newSet.delete(dishId)
      } else {
        newSet.add(dishId)
      }
      return newSet
    })
  }

  const needsTruncation = (text: string, maxLines: number) => {
    const charsPerLine = maxLines === 3 ? 50 : 80
    return text.length > maxLines * charsPerLine
  }

  const isOnlineOrder = orderType === "O"

  console.log("[v0] MenuBrowser: isOnlineOrder value:", isOnlineOrder)

  const enableDishInfo = process.env.NEXT_PUBLIC_WA_ENABLE_DISH_INFO !== "false"

  useEffect(() => {
    if (isLoading && dbDishes.length === 0) {
      const timer = setTimeout(() => {
        if (isLoading && dbDishes.length === 0) {
          setShowLoadingError(true)
        }
      }, 5000)

      return () => clearTimeout(timer)
    } else if (!isLoading && dbDishes.length > 0) {
      setShowLoadingError(false)
    }
  }, [isLoading, dbDishes.length])

  const handleRetry = async () => {
    setIsRetrying(true)
    setShowLoadingError(false)
    await refetch()

    setTimeout(() => {
      setIsRetrying(false)
    }, 1000)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
  }

  const handleSearchClose = () => {
    setSearchTerm("")
    setSearchExpanded(false)
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
  }

  useEffect(() => {
    if (searchExpanded && searchTerm === "") {
      searchTimerRef.current = setTimeout(() => {
        setSearchExpanded(false)
      }, 5000)
    }

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [searchExpanded, searchTerm])

  const { config: restaurantConfig } = useRestaurantConfigContext()

  if (isLoading && !showLoadingError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <UtensilsCrossed className="h-12 w-12 text-gray-900 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">{isRetrying ? tFunc("checkingConnection") : "Cargando menú..."}</p>
          <p className="text-sm text-gray-500 mt-2">
            Conexión: {!connectionStatus ? "Conectando..." : connectionStatus ? "Conectado" : "Desconectado"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-12 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToHome}
                className="flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full w-9 h-9 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                <img
                  src={restaurantConfig?.logo_url || "/LOGO.png"}
                  alt="Logo"
                  className="h-8 w-8 md:h-12 md:w-12 lg:h-14 lg:w-14"
                />
                <div className="flex items-center gap-1.5 md:gap-2">
                  <UtensilsCrossed className="h-5 w-5 md:h-7 md:w-7 lg:h-8 lg:w-8 text-gray-900" />
                  <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900">
                    {restaurantConfig?.name || "Sabores Caribeños"}
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <PushNotificationToggle />

              <Select
                value={language}
                onValueChange={(value: "es" | "en" | "de" | "fr" | "zh") => onLanguageChange?.(value)}
              >
                <SelectTrigger className="w-20 h-9">
                  <Languages className="h-4 w-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">ES</SelectItem>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="de">DE</SelectItem>
                  <SelectItem value="fr">FR</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            {!searchExpanded ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchExpanded(true)}
                  className="flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full w-10 h-10 p-0 transition-all duration-200"
                >
                  <Search className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={rateService}
                  className="flex items-center justify-center text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-full w-10 h-10 p-0 transition-all duration-200"
                  title={tFunc("rateService")}
                >
                  <Star className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBillConfirm(true)}
                  disabled={billButtonPulsing || isOnlineOrder}
                  className={`flex items-center justify-center rounded-full w-10 h-10 p-0 transition-all duration-200 ${
                    isOnlineOrder
                      ? "text-gray-400 cursor-not-allowed"
                      : billButtonPulsing
                        ? "text-blue-600 animate-bounce"
                        : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  }`}
                  title={isOnlineOrder ? tFunc("notAvailableOnline") : tFunc("requestBill")}
                >
                  <Receipt className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWaiterConfirm(true)}
                  disabled={waiterButtonPulsing || isOnlineOrder}
                  className={`flex items-center justify-center rounded-full w-10 h-10 p-0 transition-all duration-200 ${
                    isOnlineOrder
                      ? "text-gray-400 cursor-not-allowed"
                      : waiterButtonPulsing
                        ? "text-orange-600 animate-bounce"
                        : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  }`}
                  title={isOnlineOrder ? tFunc("notAvailableOnline") : tFunc("callWaiter")}
                >
                  <HandRaised className="h-5 w-5" />
                </Button>

                <div className="ml-auto">
                  <SessionTimer language={language} />
                </div>
              </>
            ) : (
              <>
                <div className="relative flex-1 animate-in slide-in-from-left duration-300">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={tFunc("search")}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10 pr-10 h-10 rounded-full border-gray-200 bg-white shadow-sm focus:shadow-md transition-shadow text-sm"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSearchClose}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full w-8 h-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="ml-2">
                  <SessionTimer language={language} />
                </div>
              </>
            )}
          </div>

          <div ref={categoryScrollRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                size="sm"
                onClick={() => handleCategorySelect(category.id)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-all ${
                  selectedCategory === category.id
                    ? "bg-orange-500 text-white shadow-md hover:bg-orange-600"
                    : "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main
        className="container mx-auto px-4 py-8"
        style={{ paddingBottom: "calc(6rem + env(safe-area-inset-bottom))" }}
      >
        {showLoadingError && dbDishes.length === 0 && (
          <div className="mb-6 bg-destructive/10 border-2 border-destructive rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="bg-destructive rounded-full p-3">
                  <AlertCircle className="h-6 w-6 text-destructive-foreground" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-destructive mb-2">{tFunc("menuLoadingError")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tFunc("menuLoadingErrorDesc")}</p>
                <Button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full px-6"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
                  {tFunc("retryLoading")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {searchTerm && Object.values(dishesByCategory).every((dishes) => dishes.length === 0) && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😢</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{tFunc("noResultsMessage")}</h3>
            <Button variant="outline" onClick={() => setSearchTerm("")} className="rounded-full">
              {tFunc("clearSearch")}
            </Button>
          </div>
        )}

        {Object.entries(dishesByCategory).map(([categoryId, dishes], index) => (
          <div
            key={categoryId}
            ref={(el) => (categoryRefs.current[categoryId] = el)}
            className={`mb-12 ${selectedCategory === "all" && index === 0 ? "mt-6" : ""}`}
          >
            {selectedCategory === "all" && dishes.length > 0 && (
              <h2 className="sticky top-52 z-30 bg-white/95 backdrop-blur py-2 text-2xl font-bold text-gray-900 mb-6 scroll-mt-52 border-b border-gray-100">
                {categories.find((c) => c.id === categoryId)?.label}
              </h2>
            )}

            {dishes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {dishes.map((dish) => {
                  const isExpanded = expandedCards.has(dish.id)
                  const descriptionNeedsTruncation = needsTruncation(dish.description, 3)
                  const allergensText =
                    dish.allergens && dish.allergens.length > 0
                      ? dish.allergens.map((allergen) => translateAllergen(allergen, language)).join(", ")
                      : ""
                  const allergensNeedsTruncation = needsTruncation(allergensText, 2)

                  return (
                    <Card
                      key={dish.id}
                      className={`overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] cursor-pointer border-gray-100 ${
                        dish.available === false ? "opacity-60 grayscale" : "bg-white"
                      } ${dish.estrella ? "ring-2 ring-amber-400 shadow-amber-100" : ""}`}
                      onClick={() => dish.available !== false && setSelectedDish(dish)}
                    >
                      <div className="aspect-[4/2.5] overflow-hidden relative">
                        {dish.available === false && (
                          <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">No Disponible</span>
                          </div>
                        )}

                        {typeof dish.images === "object" && dish.images.gallery && dish.images.gallery.length > 1 ? (
                          <DishImageCarousel images={dish.images.gallery} alt={dish.name} className="w-full h-full" />
                        ) : (
                          <img
                            src={
                              typeof dish.images === "object"
                                ? dish.images.main
                                : dish.images[0] || "/placeholder.svg?height=200&width=400"
                            }
                            alt={dish.name}
                            className="w-full h-full object-cover"
                          />
                        )}

                        {dish.estrella && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-20 border border-amber-300">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-xs font-bold">Estrella</span>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4 flex flex-col h-[280px]">
                        <div className="flex items-start justify-between mb-1 min-h-[40px]">
                          <h3 className="font-bold text-base text-gray-900 leading-tight line-clamp-2 flex-1">
                            {dish.name}
                          </h3>
                          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                            {enableDishInfo && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openWhatsAppInfo(dish)
                                }}
                                className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
                                title={tFunc("moreInfo")}
                              >
                                <Info className="h-3 w-3" />
                              </button>
                            )}
                            <span className="text-base font-bold text-gray-900">{moneyEUR(dish.price)}</span>
                          </div>
                        </div>

                        <Badge
                          variant="secondary"
                          className="bg-orange-50 text-orange-600 border-orange-200 text-xs w-fit"
                        >
                          {(() => {
                            const category = translateCategory(dish.category, language)
                            return category.charAt(0).toUpperCase() + category.slice(1)
                          })()}
                        </Badge>

                        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                          <div className="mb-2">
                            <p
                              className={`text-gray-600 text-sm leading-relaxed ${
                                !isExpanded && descriptionNeedsTruncation ? "line-clamp-3" : ""
                              }`}
                            >
                              {dish.description}
                            </p>
                            {descriptionNeedsTruncation && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleExpandCard(dish.id)
                                }}
                                className="text-orange-600 hover:text-orange-700 text-xs font-medium flex items-center gap-1 mt-1"
                              >
                                {isExpanded ? (
                                  <>
                                    Ver menos <ChevronUp className="h-3 w-3" />
                                  </>
                                ) : (
                                  <>
                                    Ver más <ChevronDown className="h-3 w-3" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {allergensText && (
                            <div className="mb-3">
                              <p
                                className={`text-xs text-gray-500 ${
                                  !isExpanded && allergensNeedsTruncation ? "line-clamp-2" : ""
                                }`}
                              >
                                {tFunc("allergens")}: {allergensText}
                              </p>
                              {allergensNeedsTruncation && !descriptionNeedsTruncation && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleExpandCard(dish.id)
                                  }}
                                  className="text-orange-600 hover:text-orange-700 text-xs font-medium flex items-center gap-1 mt-1"
                                >
                                  {isExpanded ? (
                                    <>
                                      Ver menos <ChevronUp className="h-3 w-3" />
                                    </>
                                  ) : (
                                    <>
                                      Ver más <ChevronDown className="h-3 w-3" />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <Button
                          disabled={dish.available === false || isUsingDefaultDish}
                          className={`w-full rounded-xl h-10 transition-all duration-200 mt-auto flex-shrink-0 ${
                            dish.available === false || isUsingDefaultDish
                              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                              : "bg-gray-900 hover:bg-gray-800 text-white active:scale-95 active:bg-orange-500 active:shadow-lg"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (dish.available === false || isUsingDefaultDish) return

                            if (dish.variants || dish.personalizations) {
                              setSelectedDish(dish)
                            } else {
                              const button = e.currentTarget
                              button.classList.add("animate-pulse", "bg-orange-500", "shadow-lg")
                              setTimeout(() => {
                                button.classList.remove("animate-pulse", "bg-orange-500", "shadow-lg")
                              }, 300)
                              addToCart(dish)
                            }
                          }}
                        >
                          {dish.available === false
                            ? "No Disponible"
                            : isUsingDefaultDish
                              ? "Menú en preparación"
                              : dish.variants || dish.personalizations
                                ? tFunc("personalizations")
                                : tFunc("addToCart")}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </main>

      {selectedDish && (
        <DishModal
          dish={selectedDish}
          language={language}
          onClose={() => setSelectedDish(null)}
          onAddToCart={addToCart}
        />
      )}

      {showStarRating && <StarRating onRating={() => {}} onClose={() => setShowStarRating(false)} />}

      <FloatingCart cart={cart} language={language} tableNumber={tableNumber} menu={dishes} />

      <AlertDialog open={showWaiterConfirm} onOpenChange={setShowWaiterConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>✋ {tFunc("confirmCallWaiter")}</AlertDialogTitle>
            <AlertDialogDescription>{tFunc("confirmCallWaiterDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tFunc("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowWaiterConfirm(false)
                callWaiter()
              }}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {tFunc("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBillConfirm} onOpenChange={setShowBillConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🧾 {tFunc("confirmRequestBill")}</AlertDialogTitle>
            <AlertDialogDescription>{tFunc("confirmRequestBillDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tFunc("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowBillConfirm(false)
                requestBill()
              }}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {tFunc("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
