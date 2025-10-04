// app/api/announcements/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export const revalidate = 0 // evita caché en Vercel/Next runtime

// Idiomas soportados en la respuesta (contrato actual del frontend)
const LANGS = ["es", "en", "de", "fr", "zh"] as const

// Mensaje por defecto si no hay anuncios visibles
const DEFAULT_MSG: Record<string, string> = {
  es: "✨¡Gracias por Visitarnos!✨ Activa la campanita para que no te pierdas ninguna de nuestras notificaciones 🔔",
  en: "✨Thanks for visiting!✨ Activate the bell so you don't miss any of our notifications 🔔",
  de: "✨Vielen Dank für Ihren Besuch!✨ Aktivieren Sie die Glocke, damit Sie keine unserer Benachrichtigungen verpassen 🔔",
  fr: "✨Merci de nous rendre visite !✨ Activez la cloche pour ne manquer aucune de nos notifications 🔔",
  zh: "感谢您的光临！表情符号 请开启铃铛，以免错过我们的任何通知  表情符号",
}

export async function GET(_req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn("Supabase environment variables not configured, returning default messages")
      const byLang: Record<string, Array<{ text: string; priority: number }>> = Object.fromEntries(
        LANGS.map((l) => [l, [{ text: DEFAULT_MSG[l], priority: 0 }]]),
      )
      return NextResponse.json(
        {
          announcements: byLang,
          lastUpdated: new Date().toISOString(),
        },
        { headers: { "Cache-Control": "no-store" } },
      )
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from("announcements_visible_now")
      .select("content_translations, priority, updated_at")
      .order("priority", { ascending: false })
      .order("updated_at", { ascending: false })

    if (error) {
      const isNetworkError =
        error.message.includes("Failed to fetch") ||
        error.message.includes("fetch failed") ||
        error.message.includes("NetworkError")

      if (isNetworkError) {
        console.warn("[v0] Network unavailable (offline), returning default announcements")
      } else {
        console.error("[v0] Supabase error:", error.message)
      }

      const byLang: Record<string, Array<{ text: string; priority: number }>> = Object.fromEntries(
        LANGS.map((l) => [l, [{ text: DEFAULT_MSG[l], priority: 0 }]]),
      )
      return NextResponse.json(
        {
          announcements: byLang,
          lastUpdated: new Date().toISOString(),
        },
        { headers: { "Cache-Control": "no-store" } },
      )
    }

    const byLang: Record<string, Array<{ text: string; priority: number }>> = Object.fromEntries(
      LANGS.map((l) => [l, [] as Array<{ text: string; priority: number }>]),
    )

    for (const row of data || []) {
      const ct =
        typeof row.content_translations === "string"
          ? (JSON.parse(row.content_translations) as Record<string, string>)
          : (row.content_translations as Record<string, string> | null)

      if (!ct) continue

      const priority = (row.priority as number) || 0

      for (const lang of LANGS) {
        const msg = (ct[lang] || "").trim()
        if (msg) byLang[lang].push({ text: msg, priority })
      }
    }

    const hasAny = LANGS.some((l) => (byLang[l]?.length ?? 0) > 0)
    if (!hasAny) {
      for (const l of LANGS) byLang[l] = [{ text: DEFAULT_MSG[l], priority: 0 }]
    }

    return NextResponse.json(
      {
        announcements: byLang,
        lastUpdated: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (e) {
    const isNetworkError =
      e instanceof TypeError && (e.message.includes("Failed to fetch") || e.message.includes("fetch failed"))

    if (isNetworkError) {
      console.warn("[v0] Network unavailable, returning default announcements")
    } else {
      console.error("[v0] Unexpected error in announcements API:", e)
    }

    const byLang: Record<string, Array<{ text: string; priority: number }>> = Object.fromEntries(
      LANGS.map((l) => [l, [{ text: DEFAULT_MSG[l], priority: 0 }]]),
    )
    return NextResponse.json(
      {
        announcements: byLang,
        lastUpdated: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { announcements, language } = await request.json()
    console.log("Updating announcements for language:", language, announcements)
    return NextResponse.json(
      {
        success: true,
        message: "Announcements updated successfully",
        timestamp: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update announcements" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    )
  }
}
