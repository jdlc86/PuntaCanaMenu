import { NextResponse } from "next/server"
import { validateTableToken } from "@/lib/jwt"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = body

    console.log("[v0] validate-token API: Received validation request")

    if (!token) {
      console.error("[v0] validate-token API: No token provided")
      return NextResponse.json(
        {
          valid: false,
          error: "Token is required",
        },
        { status: 400 },
      )
    }

    console.log("[v0] validate-token API: Validating token...")
    const result = await validateTableToken(token)
    console.log("[v0] validate-token API: Validation result:", { valid: result.valid, error: result.error })

    if (!result.valid) {
      console.error("[v0] validate-token API: Token validation failed:", result.error)
      return NextResponse.json(
        {
          valid: false,
          error: result.error,
        },
        { status: 401 },
      )
    }

    console.log("[v0] validate-token API: Token validated successfully")
    return NextResponse.json({
      valid: true,
      payload: result.payload,
    })
  } catch (error) {
    console.error("[v0] validate-token API: Exception occurred:", error)
    return NextResponse.json(
      {
        valid: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
