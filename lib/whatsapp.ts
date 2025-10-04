import { buildWAText } from "./money"

export interface WhatsAppOrderData {
  orderId: string
  total: number
  tip?: number
  phone?: string
  countryCode?: string // por defecto "34"
}

function normalizePhone(raw: string, countryCode = "34"): string {
  if (!raw) return ""
  let d = raw.replace(/\D+/g, "")
  if (d.startsWith("00")) d = d.slice(2)
  if (d.startsWith("0")) d = d.slice(1)
  if (!d.startsWith(countryCode)) d = countryCode + d
  return d
}

export function openWhatsApp({ orderId, total, tip = 0, phone, countryCode = "34" }: WhatsAppOrderData): string {
  const envPhone = process.env.NEXT_PUBLIC_WA_PHONE || "34600000000"
  const normalized = normalizePhone(phone || envPhone, countryCode)

  const text = buildWAText(orderId, total, tip)
  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`

  console.log("[v0] WhatsApp - Opening URL:", url)

  // En SSR solo devolvemos la URL
  if (typeof window === "undefined") return url

  try {
    const newWindow = window.open(url, "_blank")
    if (!newWindow) {
      // If popup was blocked, fallback to same window
      console.log("[v0] WhatsApp - Popup blocked, using same window")
      window.location.href = url
    }
  } catch (error) {
    console.error("[v0] WhatsApp - Error opening:", error)
    window.location.href = url
  }

  return url
}
