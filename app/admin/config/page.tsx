"use client"

import { useState, useEffect } from "react"
import { useRestaurantConfig } from "@/lib/useRestaurantConfig"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Save, Loader2, AlertCircle } from "lucide-react"
import type { RestaurantConfig } from "@/types/restaurant-config"

export default function AdminConfigPage() {
  const { config, isLoading, mutate } = useRestaurantConfig()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<RestaurantConfig>>({})
  const [isUsingDefaults, setIsUsingDefaults] = useState(false)

  useEffect(() => {
    console.log("[v0] Admin Config: Config loaded:", config)
    if (config) {
      setFormData(config)
      setIsUsingDefaults(false)
    } else {
      setIsUsingDefaults(true)
      setFormData({
        restaurant_id: "default",
        name: "Sabores Caribeños",
        description: "Auténtica cocina caribeña con los mejores sabores del trópico",
        logo_url: "/LOGO.png",
        primary_color: "#d97706",
        secondary_color: "#ec4899",
        accent_color: "#f59e0b",
        phone: "34647944762",
        email: "info@saborescaribenos.com",
        whatsapp_number: "34647944762",
        default_language: "es",
        currency: "EUR",
        currency_symbol: "€",
        enable_ratings: true,
        enable_waiter_call: true,
        enable_bill_request: true,
      })
    }
  }, [config])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      console.log("[v0] Admin Config: Saving config:", formData)

      const response = await fetch("/api/restaurant-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log("[v0] Admin Config: Save response:", data)

      if (data.ok) {
        toast({
          title: "✅ Configuración guardada",
          description: "Los cambios se han guardado correctamente",
        })
        setIsUsingDefaults(false)
        mutate()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("[v0] Admin Config: Error saving:", error)
      toast({
        title: "❌ Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuración del Restaurante</h1>
        <p className="text-gray-600 mt-2">Personaliza la apariencia y configuración global de tu restaurante</p>
      </div>

      {isUsingDefaults && (
        <Card className="p-4 mb-6 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Usando configuración por defecto</h3>
              <p className="text-sm text-amber-700 mt-1">
                La tabla de configuración no existe en la base de datos. Ejecuta el script{" "}
                <code className="bg-amber-100 px-1 py-0.5 rounded">scripts/001_create_restaurant_config.sql</code> para
                crear la tabla y guardar tu configuración.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Restaurante</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mi Restaurante"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Bienvenido a nuestro restaurante..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="logo_url">URL del Logo</Label>
              <Input
                id="logo_url"
                value={formData.logo_url || ""}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Información de Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+34 123 456 789"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@restaurante.com"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Calle Principal 123, Ciudad"
              />
            </div>
          </div>
        </Card>

        {/* Branding Colors */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Colores de Marca</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="primary_color">Color Primario</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color || "#d97706"}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.primary_color || "#d97706"}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  placeholder="#d97706"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondary_color">Color Secundario</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={formData.secondary_color || "#ec4899"}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.secondary_color || "#ec4899"}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  placeholder="#ec4899"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="accent_color">Color de Acento</Label>
              <div className="flex gap-2">
                <Input
                  id="accent_color"
                  type="color"
                  value={formData.accent_color || "#f59e0b"}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.accent_color || "#f59e0b"}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                  placeholder="#f59e0b"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Welcome Messages */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Mensajes de Bienvenida</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="welcome_es">Español</Label>
              <Input
                id="welcome_es"
                value={formData.welcome_message_es || ""}
                onChange={(e) => setFormData({ ...formData, welcome_message_es: e.target.value })}
                placeholder="¡Bienvenido!"
              />
            </div>
            <div>
              <Label htmlFor="welcome_en">English</Label>
              <Input
                id="welcome_en"
                value={formData.welcome_message_en || ""}
                onChange={(e) => setFormData({ ...formData, welcome_message_en: e.target.value })}
                placeholder="Welcome!"
              />
            </div>
          </div>
        </Card>

        {/* Features */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Funcionalidades</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable_ratings">Habilitar Calificaciones</Label>
              <Switch
                id="enable_ratings"
                checked={formData.enable_ratings || false}
                onCheckedChange={(checked) => setFormData({ ...formData, enable_ratings: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enable_waiter_call">Habilitar Llamar al Camarero</Label>
              <Switch
                id="enable_waiter_call"
                checked={formData.enable_waiter_call || false}
                onCheckedChange={(checked) => setFormData({ ...formData, enable_waiter_call: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enable_bill_request">Habilitar Solicitar la Cuenta</Label>
              <Switch
                id="enable_bill_request"
                checked={formData.enable_bill_request || false}
                onCheckedChange={(checked) => setFormData({ ...formData, enable_bill_request: checked })}
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} size="lg" className="bg-orange-500 hover:bg-orange-600">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Configuración
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
