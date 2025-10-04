/**
 * JWT validation utilities for Cloudflare Worker signed payloads
 * Validates tokens containing: table_id, order_type, iat, exp
 *
 * SECURITY NOTE: This file should only be used on the SERVER side.
 * JWT_SECRET must NEVER be exposed to the client.
 */

export interface TablePayload {
  table_id: string
  order_type: "R" | "O" | "C" // R=Restaurant, O=Online, C=Camarero
  iat: number // issued at timestamp
  exp: number // expiration timestamp
}

export interface JWTValidationResult {
  valid: boolean
  payload?: TablePayload
  error?: string
}

/**
 * Decode JWT payload without verification (for reading claims)
 * This is safe to use on client side as it only reads the payload
 */
export function decodeJWT(token: string): TablePayload | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))
    return decoded as TablePayload
  } catch (error) {
    console.error("[v0] Error decoding JWT:", error)
    return null
  }
}

/**
 * Verify JWT signature using HMAC SHA-256
 * SERVER-SIDE ONLY - requires JWT_SECRET
 */
export async function verifyJWT(token: string, secret: string): Promise<JWTValidationResult> {
  try {
    console.log("[v0] verifyJWT: Starting JWT verification")

    const parts = token.split(".")
    if (parts.length !== 3) {
      console.error("[v0] verifyJWT: Invalid token format - expected 3 parts, got", parts.length)
      return { valid: false, error: "Invalid token format" }
    }

    const [headerB64, payloadB64, signatureB64] = parts
    const payload = decodeJWT(token)

    if (!payload) {
      console.error("[v0] verifyJWT: Failed to decode payload")
      return { valid: false, error: "Invalid payload" }
    }

    console.log("[v0] verifyJWT: Decoded payload:", payload)

    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      console.error("[v0] verifyJWT: Token expired", { exp: payload.exp, now })
      return { valid: false, error: "Token expired" }
    }

    // Check issued at (not in future)
    if (payload.iat && payload.iat > now + 60) {
      console.error("[v0] verifyJWT: Token issued in future", { iat: payload.iat, now })
      return { valid: false, error: "Token issued in future" }
    }

    // Verify signature using Web Crypto API
    console.log("[v0] verifyJWT: Verifying signature...")
    const encoder = new TextEncoder()
    const data = `${headerB64}.${payloadB64}`
    const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
      "verify",
    ])

    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))

    const valid = await crypto.subtle.verify("HMAC", key, signature, encoder.encode(data))

    if (!valid) {
      console.error("[v0] verifyJWT: Signature verification failed - token has been modified")
      return { valid: false, error: "Invalid signature - token has been tampered with" }
    }

    console.log("[v0] verifyJWT: Signature verified successfully")
    return { valid: true, payload }
  } catch (error) {
    console.error("[v0] verifyJWT: Exception during verification:", error)
    return { valid: false, error: "Verification failed" }
  }
}

/**
 * Validate table token from request
 * SERVER-SIDE ONLY - requires JWT_SECRET environment variable
 */
export async function validateTableToken(token: string | null): Promise<JWTValidationResult> {
  if (!token) {
    return { valid: false, error: "No token provided" }
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error("[v0] JWT_SECRET not configured - this is required for production")
    return { valid: false, error: "Server configuration error" }
  }

  return await verifyJWT(token, secret)
}

/**
 * Extract token from Authorization header or query parameter
 */
export function extractToken(request: Request): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get("Authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  // Try query parameter
  const url = new URL(request.url)
  const tokenParam = url.searchParams.get("token")
  if (tokenParam) {
    return tokenParam
  }

  return null
}
