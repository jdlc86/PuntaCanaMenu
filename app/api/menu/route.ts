import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import type { MenuDish } from "@/types/menu"

export const revalidate = 0 // evita caché en Vercel/Next runtime

function mapDatabaseRowToMenuDish(row: any): MenuDish {
  // Use the actual column names from the database
  const name = row.name || "Sin nombre"
  const description = row.description || ""

  // Map images from the images array
  let mainImage = "/placeholder.svg?height=200&width=400"
  let galleryImages = [mainImage]

  if (row.images && Array.isArray(row.images) && row.images.length > 0) {
    // Find primary image or use first image
    const primaryImage = row.images.find((img: any) => img.is_primary)
    mainImage = primaryImage?.url || row.images[0]?.url || mainImage
    galleryImages = row.images.map((img: any) => img.url).filter(Boolean)
  }

  return {
    id: row.id,
    name,
    category: row.category,
    description,
    price: row.price ? Number(row.price) : null,
    allergens: row.allergens || [],
    images: {
      main: mainImage,
      gallery: galleryImages,
    },
    available: row.is_available !== false,
    schedule: row.start_time && row.end_time ? { start: row.start_time, end: row.end_time } : undefined,
    estrella: row.is_featured || false,
  }
}

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) {
      return NextResponse.json(
        {
          dishes: [],
          lastUpdated: new Date().toISOString(),
        },
        { headers: { "Cache-Control": "no-store" } },
      )
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase.from("menu_items").select("*")

    if (error) {
      const isNetworkError = error.message.includes("Failed to fetch") || error.message.includes("fetch failed")

      if (isNetworkError) {
        console.warn("[v0] Network unavailable (offline), returning empty menu")
      } else {
        console.error("[v0] Supabase error:", error.message)
      }

      return NextResponse.json(
        {
          dishes: [],
          lastUpdated: new Date().toISOString(),
        },
        { headers: { "Cache-Control": "no-store" } },
      )
    }

    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 8) // HH:MM:SS format

    const filteredData = (data || []).filter((item) => {
      // First check: item must be available (or availability not set)
      if (item.is_available === false) {
        return false
      }

      // Second check: handle scheduling
      // If item is not scheduled OR scheduling is not set, it's always available
      if (!item.is_scheduled || item.is_scheduled === false) {
        return true
      }

      // If scheduled but no times set, show it anyway (don't hide items with incomplete config)
      if (!item.start_time || !item.end_time) {
        return true
      }

      // Check if current time is within schedule
      return currentTime >= item.start_time && currentTime <= item.end_time
    })

    console.log("[v0] Menu API: Total items from DB:", data?.length || 0)
    console.log("[v0] Menu API: Filtered items:", filteredData.length)

    // Sort by display_order if it exists, then by id
    const sortedData = filteredData.sort((a, b) => {
      if (a.display_order !== undefined && b.display_order !== undefined) {
        const orderDiff = a.display_order - b.display_order
        if (orderDiff !== 0) return orderDiff
      }
      return a.id - b.id
    })

    const dishes: MenuDish[] = sortedData.map(mapDatabaseRowToMenuDish)

    return NextResponse.json(
      {
        dishes,
        lastUpdated: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (e) {
    const isNetworkError =
      e instanceof TypeError && (e.message.includes("Failed to fetch") || e.message.includes("fetch failed"))

    if (isNetworkError) {
      // Network error - log as warning only (offline mode)
      console.warn("[v0] Network unavailable, returning empty menu")
    } else {
      // Other unexpected errors - log as error
      console.error("[v0] Unexpected error in menu API:", e)
    }

    return NextResponse.json(
      {
        dishes: [],
        lastUpdated: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.function === "getPublicMenu") {
      // Redirect to GET endpoint
      const response = await GET()
      const data = await response.json()
      return NextResponse.json(data.dishes)
    }

    return NextResponse.json({ error: "Function not found" }, { status: 404 })
  } catch (error) {
    console.error("[v0] Error in menu API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
