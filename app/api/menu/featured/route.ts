import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import type { MenuDish } from "@/types/menu"

export const revalidate = 0

function mapDatabaseRowToMenuDish(row: any): MenuDish {
  const name = row.name || row.name_es || "Sin nombre"
  const description = row.description || row.description_es || ""

  let mainImage = "/placeholder.svg?height=200&width=400"
  let galleryImages = [mainImage]

  if (row.images && Array.isArray(row.images) && row.images.length > 0) {
    const primaryImage = row.images.find((img: any) => img.is_primary)
    mainImage = primaryImage?.url || row.images[0]?.url || mainImage
    galleryImages = row.images.map((img: any) => img.url).filter(Boolean)
  } else if (row.main_image) {
    mainImage = row.main_image
    if (row.gallery_images && Array.isArray(row.gallery_images)) {
      galleryImages = row.gallery_images
    }
  }

  const category = row.category || row.category_id || "general"

  const price = row.price ? Number(row.price) : row.base_price ? Number(row.base_price) : 0

  const available = row.is_available !== false && row.available !== false

  return {
    id: String(row.id),
    name,
    category,
    description,
    price,
    allergens: row.allergens || [],
    images: {
      main: mainImage,
      gallery: galleryImages,
    },
    available,
    estrella: row.is_featured === true,
  }
}

export async function GET() {
  try {
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

    // Then filter in JavaScript like the working /api/menu route does
    const { data, error } = await supabase.from("menu_items").select("*")

    if (error) {
      const isNetworkError = error.message.includes("Failed to fetch") || error.message.includes("fetch failed")

      if (isNetworkError) {
        console.warn("[v0] Network unavailable (offline), returning empty featured dishes")
      } else {
        console.error("[v0] Supabase error fetching featured dishes:", error.message)
      }

      return NextResponse.json(
        {
          dishes: [],
          lastUpdated: new Date().toISOString(),
        },
        { headers: { "Cache-Control": "no-store" } },
      )
    }

    const filteredData = (data || []).filter((item) => {
      // Check if item is available
      const isAvailable = item.is_available !== false && item.available !== false

      // Check if item is featured
      const isFeatured = item.is_featured === true

      return isAvailable && isFeatured
    })

    console.log("[v0] Featured API: Total items from DB:", data?.length || 0)
    console.log("[v0] Featured API: Filtered featured items:", filteredData.length)

    const sortedData = filteredData.sort((a, b) => {
      if (a.display_order !== undefined && b.display_order !== undefined) {
        const orderDiff = a.display_order - b.display_order
        if (orderDiff !== 0) return orderDiff
      }
      // Fallback to created_at if available
      if (a.created_at && b.created_at) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return 0
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
      console.warn("[v0] Network unavailable, returning empty featured dishes")
    } else {
      // Other unexpected errors - log as error
      console.error("[v0] Unexpected error in featured menu API:", e)
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
