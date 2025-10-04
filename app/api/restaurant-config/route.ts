import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get("restaurant_id") || "default"

    console.log("[v0] Restaurant Config API: Fetching config for:", restaurantId)

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from("restaurant_config")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .maybeSingle()

    if (error) {
      console.error("[v0] Restaurant Config API: Supabase error:", error.message)
      return NextResponse.json(
        {
          ok: false,
          hasConfig: false,
          error: "Failed to fetch restaurant configuration",
        },
        { status: 500 },
      )
    }

    if (!data) {
      console.log("[v0] Restaurant Config API: No config found, returning empty state")
      return NextResponse.json({
        ok: true,
        hasConfig: false,
        config: null,
      })
    }

    console.log("[v0] Restaurant Config API: Config found successfully:", data.name)
    return NextResponse.json({
      ok: true,
      hasConfig: true,
      config: data,
    })
  } catch (error) {
    console.error("[v0] Restaurant Config API: Error fetching config:", error)
    return NextResponse.json(
      {
        ok: false,
        hasConfig: false,
        error: "Failed to fetch restaurant configuration",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { restaurant_id = "default", ...updates } = body

    console.log("[v0] Restaurant Config API: Updating config for:", restaurant_id)
    console.log("[v0] Restaurant Config API: Updates:", Object.keys(updates))

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from("restaurant_config")
      .update(updates)
      .eq("restaurant_id", restaurant_id)
      .select()
      .maybeSingle()

    if (error) {
      console.error("[v0] Restaurant Config API: Supabase error:", error.message)
      return NextResponse.json(
        {
          ok: false,
          error: "Failed to update restaurant configuration",
        },
        { status: 500 },
      )
    }

    if (!data) {
      console.log("[v0] Restaurant Config API: No config found to update")
      return NextResponse.json(
        {
          ok: false,
          error: "Restaurant configuration not found",
        },
        { status: 404 },
      )
    }

    console.log("[v0] Restaurant Config API: Config updated successfully")
    return NextResponse.json({
      ok: true,
      config: data,
    })
  } catch (error) {
    console.error("[v0] Restaurant Config API: Error updating config:", error)
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to update restaurant configuration",
      },
      { status: 500 },
    )
  }
}
