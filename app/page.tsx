"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UtensilsCrossed, Languages, Star, Plus, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import MenuBrowser from "@/components/menu-browser"
import { useCart } from "@/lib/cart-context"
import { useTable } from "@/lib/table-context"
import type { MenuDish } from "@/types/menu"
import AnnouncementBar from "@/components/announcement-bar"
import ToastNotification from "@/components/toast-notification"
import { moneyEUR } from "@/lib/money"
import { useFeaturedDishes } from "@/lib/useFeaturedDishes"
import PushNotificationToggle from "@/components/push-notification-toggle"
import { useRestaurantConfigContext } from "@/lib/restaurant-config-context"

const getDefaultDish = (language: "es" | "en" | "de" | "fr" | "zh"): MenuDish => {
  const translations = {
    es: {
      name: "Bienvenidos/as",
      description: "Estamos preparando nuestro menú especial para ti",
    },
    en: {
      name: "Welcome",
      description: "We are preparing our special menu for you",
    },
    de: {
      name: "Willkommen",
      description: "Wir bereiten unser Spezialmenü für Sie vor",
    },
    fr: {
      name: "Bienvenue",
      description: "Nous préparons notre menu spécial pour vous",
    },
    zh: {
      name: "欢迎",
      description: "我们正在为您准备特别菜单",
    },
  }

  return {
    id: "default",
    name: translations[language].name,
    category: "general",
    description: translations[language].description,
    price: 0,
    allergens: [],
    images: {
      main: "/restaurant-welcome.jpg",
      gallery: [],
    },
    available: false,
    estrella: true,
  }
}

function RestaurantAppContent() {
  const [currentView, setCurrentView] = useState<"loading" | "welcome" | "menu">("loading")
  const { tableNumber, orderType, token, isValidated, isLoading, error, language, setLanguage } = useTable()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0)
  const { addToCart } = useCart()

  const { config: restaurantConfig } = useRestaurantConfigContext()

  const { dishes: featuredDishesFromDB, isLoading: isFeaturedLoading } = useFeaturedDishes()

  const defaultDish = useMemo(() => getDefaultDish(language), [language])

  const featuredDishes = featuredDishesFromDB.length > 0 ? featuredDishesFromDB : [defaultDish]
  const hasRealDishes = featuredDishesFromDB.length > 0

  useEffect(() => {
    console.log("[v0] RestaurantApp: Validation state:", { isLoading, isValidated, error })

    if (!isLoading) {
      if (isValidated) {
        const timer = setTimeout(() => {
          setCurrentView("welcome")
        }, 1000)
        return () => clearTimeout(timer)
      } else {
        setCurrentView("loading")
      }
    }
  }, [isLoading, isValidated, error])

  const texts = {
    es: {
      welcome: "Bienvenidos/as a",
      restaurantName: restaurantConfig?.name || "Restaurante Sabores",
      loading: "Cargando...",
      language: "Idioma",
      assignedTable: "Mesa Asignada",
      tableNumber: "Mesa",
      continueToMenu: "Ver Menú",
      welcomeMessage:
        restaurantConfig?.welcome_message_es || "¡Nos alegra tenerte aquí! Tu mesa {tableNumber} ha sido asignada.",
      featuredDish: "Plato Estrella",
      featuredDishes: "Platos Estrella",
      addToCart: "Añadir",
      addedToCart: "¡Añadido al carrito!",
      customizeFromCart: "Personaliza desde el carrito.",
    },
    en: {
      welcome: "Welcome to",
      restaurantName: restaurantConfig?.name || "Sabores Restaurant",
      loading: "Loading...",
      language: "Language",
      assignedTable: "Assigned Table",
      tableNumber: "Table",
      continueToMenu: "View Menu",
      welcomeMessage:
        restaurantConfig?.welcome_message_en ||
        "We're glad to have you here! Your table {tableNumber} has been assigned.",
      featuredDish: "Featured Dish",
      featuredDishes: "Featured Dishes",
      addToCart: "Add to Cart",
      addedToCart: "Added to cart!",
      customizeFromCart: "Customize from cart.",
    },
    de: {
      welcome: "Willkommen bei",
      restaurantName: restaurantConfig?.name || "Restaurant Sabores",
      loading: "Laden...",
      language: "Sprache",
      assignedTable: "Zugewiesener Tisch",
      tableNumber: "Tisch",
      continueToMenu: "Menü anzeigen",
      welcomeMessage:
        restaurantConfig?.welcome_message_de ||
        "Wir freuen uns, Sie hier zu haben! Ihr Tisch {tableNumber} wurde zugewiesen.",
      featuredDish: "Spezialität",
      featuredDishes: "Spezialitäten",
      addToCart: "Hinzufügen",
      addedToCart: "Zum Warenkorb hinzugefügt!",
      customizeFromCart: "Vom Warenkorb anpassen.",
    },
    fr: {
      welcome: "Bienvenue chez",
      restaurantName: restaurantConfig?.name || "Restaurant Sabores",
      loading: "Chargement...",
      language: "Langue",
      assignedTable: "Table Assignée",
      tableNumber: "Table",
      continueToMenu: "Voir le Menu",
      welcomeMessage:
        restaurantConfig?.welcome_message_fr ||
        "Nous sommes ravis de vous avoir ici! Votre table {tableNumber} a été assignée.",
      featuredDish: "Plat Vedette",
      featuredDishes: "Plats Vedettes",
      addToCart: "Ajouter",
      addedToCart: "Ajouté au panier!",
      customizeFromCart: "Personnaliser depuis le panier.",
    },
    zh: {
      welcome: "欢迎来到",
      restaurantName: restaurantConfig?.name || "萨博雷斯餐厅",
      loading: "加载中...",
      language: "语言",
      assignedTable: "分配的桌子",
      tableNumber: "桌子",
      continueToMenu: "查看菜单",
      welcomeMessage: restaurantConfig?.welcome_message_zh || "我们很高兴您来到这里！您的桌子 {tableNumber} 已分配。",
      featuredDish: "招牌菜",
      featuredDishes: "招牌菜",
      addToCart: "添加",
      addedToCart: "已添加到购物车！",
      customizeFromCart: "从购物车定制。",
    },
  }

  const t = texts[language]

  const handleAddFeaturedDish = (dish: MenuDish) => {
    if (!hasRealDishes || dish.id === "default") {
      return
    }

    const hasCustomizations =
      (dish.variants && dish.variants.length > 0) || (dish.personalizations && dish.personalizations.length > 0)

    if (hasCustomizations) {
      addToCart(dish, 1)
      setToastMessage(t.customizeFromCart)
      setShowToast(true)
    } else {
      addToCart(dish, 1)
      setToastMessage(`${t.addedToCart} ${dish.name} - ${moneyEUR(dish.price)}`)
      setShowToast(true)
    }

    setTimeout(() => setCurrentView("menu"), 1500)
  }

  const nextFeatured = () => {
    setCurrentFeaturedIndex((prev) => (prev + 1) % featuredDishes.length)
  }

  const prevFeatured = () => {
    setCurrentFeaturedIndex((prev) => (prev - 1 + featuredDishes.length) % featuredDishes.length)
  }

  if (error || (!isLoading && !isValidated)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-destructive rounded-lg p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-destructive/10 rounded-full p-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Acceso No Autorizado</h2>
          <p className="text-muted-foreground">
            {error ||
              "No se pudo validar su token de acceso. El token puede estar expirado, modificado o ser inválido."}
          </p>
          <div className="pt-4 space-y-2 text-sm text-muted-foreground">
            <p>Por favor:</p>
            <ul className="list-disc list-inside text-left space-y-1">
              <li>Escanee nuevamente el código QR de su mesa</li>
              <li>Solicite ayuda al personal del restaurante</li>
              <li>Verifique que el enlace no haya sido modificado</li>
            </ul>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (currentView === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <UtensilsCrossed className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">{t.loading}</p>
          <p className="text-sm text-muted-foreground mt-2">Validando acceso...</p>
        </div>
      </div>
    )
  }

  if (!isValidated) {
    return null
  }

  if (currentView === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card/30 to-background flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4 pb-safe">
          <div className="max-w-lg w-full space-y-8">
            <div className="logo-area text-center">
              <div className="flex items-center justify-center mb-4">
                <div
                  className="rounded-full p-4 shadow-lg"
                  style={{ backgroundColor: restaurantConfig?.primary_color || "#d97706" }}
                >
                  <img
                    src={restaurantConfig?.logo_url || "/LOGO.png"}
                    alt={`${restaurantConfig?.name || "Restaurant"} Logo`}
                    className="h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20"
                  />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2 text-balance">
                {t.welcome}
              </h1>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance"
                style={{ color: restaurantConfig?.primary_color || "#d97706" }}
              >
                {t.restaurantName}
              </h2>
              <p className="text-muted-foreground mt-4 text-pretty">
                {t.welcomeMessage.replace("{tableNumber}", tableNumber || "—")}
              </p>
            </div>

            {featuredDishes.length > 0 && (
              <div className="featured-dishes">
                <div className="relative group">
                  <div className="relative">
                    <img
                      src={featuredDishes[currentFeaturedIndex].images.main || "/placeholder.svg?height=256&width=400"}
                      alt={featuredDishes[currentFeaturedIndex].name}
                      className="w-full h-64 object-cover rounded-2xl"
                    />
                    <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-semibold">
                        {featuredDishes.length > 1 ? t.featuredDishes : t.featuredDish}
                      </span>
                    </div>

                    {featuredDishes.length > 1 && (
                      <>
                        <Button
                          onClick={prevFeatured}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                          size="icon"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={nextFeatured}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                          size="icon"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {hasRealDishes && (
                      <Button
                        onClick={() => handleAddFeaturedDish(featuredDishes[currentFeaturedIndex])}
                        className="absolute bottom-4 right-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-3 shadow-lg animate-pulse hover:animate-none transition-all duration-300 hover:scale-110"
                        size="icon"
                      >
                        <Plus className="h-5 w-5 animate-bounce" />
                      </Button>
                    )}
                  </div>

                  <div className="p-4 bg-card rounded-b-2xl">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xl font-bold text-card-foreground">
                        {featuredDishes[currentFeaturedIndex].name}
                      </h3>
                      {hasRealDishes && (
                        <span className="text-lg font-bold text-primary">
                          {moneyEUR(featuredDishes[currentFeaturedIndex].price)}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">{featuredDishes[currentFeaturedIndex].description}</p>

                    {featuredDishes.length > 1 && (
                      <div className="flex justify-center gap-2 mt-3">
                        {featuredDishes.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentFeaturedIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentFeaturedIndex ? "bg-primary" : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 shadow-lg pb-safe">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
            <PushNotificationToggle />
            <Select value={language} onValueChange={(value: "es" | "en" | "de" | "fr" | "zh") => setLanguage(value)}>
              <SelectTrigger className="w-24">
                <Languages className="h-4 w-4" />
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
            <Button
              onClick={() => setCurrentView("menu")}
              className="flex-1 text-lg py-3 shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              {t.continueToMenu}
            </Button>
          </div>
        </div>

        <ToastNotification show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar language={language} />

      <MenuBrowser
        tableNumber={tableNumber}
        language={language}
        onBackToHome={() => setCurrentView("welcome")}
        dishes={featuredDishesFromDB.length > 0 ? featuredDishesFromDB : [defaultDish]}
        onLanguageChange={setLanguage}
      />
    </div>
  )
}

export default function RestaurantApp() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <UtensilsCrossed className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-lg text-muted-foreground">Cargando...</p>
          </div>
        </div>
      }
    >
      <RestaurantAppContent />
    </Suspense>
  )
}
