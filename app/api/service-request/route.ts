// app/api/service/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { extractToken, validateTableToken } from "@/lib/jwt"
import { createServiceClient } from "@/lib/supabase/server"

// Fuerza Node.js (no edge) y sin caché
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function normalizeTableLabel(input: string) {
  const raw = (input ?? "").toString().trim()
  const match = raw.match(/(\d+)/)
  const numberOnly = match ? match[1] : raw
  const std = `Mesa: ${numberOnly}`
  return { std, numberOnly }
}

// Mensajes amables para usuario final
function userMsg(lang: string, code: "TABLE_NOT_FOUND" | "TABLE_INACTIVE", table: string) {
  const l = (lang || "es").toLowerCase()
  const T = table
  const M: Record<string, Record<string, string>> = {
    es: {
      TABLE_NOT_FOUND: `No encontramos la mesa "${T}". Verifica el número o avisa al personal.`,
      TABLE_INACTIVE: `La mesa "${T}" no está activa en este momento. Por favor, avisa al personal.`,
    },
    en: {
      TABLE_NOT_FOUND: `We couldn't find table "${T}". Please verify the number or ask a staff member.`,
      TABLE_INACTIVE: `Table "${T}" is not active right now. Please ask a staff member.`,
    },
  }
  return M[l]?.[code] ?? M["es"][code]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, tableNumber, language, rating, timestamp } = body ?? {}

    // Validaciones básicas
    if (!type || !tableNumber || !language || timestamp == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const ts = new Date(Number.isFinite(timestamp) ? timestamp : timestamp)
    if (isNaN(ts.getTime())) {
      return NextResponse.json({ error: "Invalid timestamp" }, { status: 400 })
    }

    console.log("[v0] Service request received:", {
      type,
      tableNumber,
      language,
      rating,
      timestamp: ts.toISOString(),
    })

    // JWT (opcional). Si tu JWT trae table_number, comparamos contra "Mesa: X"
    const token = extractToken(request)
    if (token) {
      const validation = await validateTableToken(token)
      if (!validation.valid) {
        // ⚠️ Este caso sigue devolviendo 401 (auth real fallida).
        return NextResponse.json(
          { error: "Invalid or expired table token", details: validation.error },
          { status: 401 },
        )
      }

      const { std } = normalizeTableLabel(tableNumber)

      // Opción A: el payload trae table_number (recomendado)
      if (validation.payload?.table_number && validation.payload.table_number !== std) {
        // Si prefieres enmascarar también desajustes de token, puedes devolver 200 aquí.
        return NextResponse.json({ error: "Table number mismatch" }, { status: 403 })
      }

      console.log("[v0] Token OK for table payload:", validation.payload)
    } else {
      console.warn("[v0] Request without token (dev mode)")
    }

    // ——— Acciones ———
    if (type === "call_waiter" || type === "request_bill") {
      const supabase = createServiceClient()
      const { std, numberOnly } = normalizeTableLabel(tableNumber)

      // lookup robusto
      let { data: tableData } = await supabase
        .from("tables")
        .select("id, table_number, is_active")
        .eq("table_number", std)
        .maybeSingle()

      if (!tableData) {
        const res2 = await supabase
          .from("tables")
          .select("id, table_number, is_active")
          .eq("table_number", numberOnly)
          .maybeSingle()
        tableData = res2.data ?? null
      }

      // 🚩 ENMASCARAR: mesa no existe → 200 con mensaje amable
      if (!tableData) {
        const msg = userMsg(language, "TABLE_NOT_FOUND", std)
        console.warn(`[v0] Table not found: "${std}" → masking as 200`)
        return NextResponse.json(
          {
            success: true,
            // Mantenemos el mismo shape que éxito para que la UI no muestre error genérico
            message: msg,
            type,
            tableNumber: std,
          },
          { status: 200 },
        )
      }

      // 🚩 ENMASCARAR: mesa inactiva → 200 con mensaje amable
      if (tableData.is_active === false) {
        const msg = userMsg(language, "TABLE_INACTIVE", tableData.table_number)
        console.warn(`[v0] Table inactive: "${tableData.table_number}" → masking as 200`)
        return NextResponse.json(
          {
            success: true,
            message: msg,
            type,
            tableNumber: tableData.table_number,
          },
          { status: 200 },
        )
      }

      const tipo = type === "call_waiter" ? "General" : "Cuenta"

      // INSERTA (como tu versión original)
      const insertPayload: Record<string, any> = {
        table_id: tableData.id,
        tipo,
        status: "Pendiente",
      }
      // Si waiter_calls tiene NOT NULL extra, añádelos:
      // insertPayload.language = language
      // insertPayload.requested_at = ts.toISOString()

      const { error: dbError } = await supabase.from("waiter_calls").insert(insertPayload)
      if (dbError) {
        // Este caso lo dejamos como 500 real (problema del sistema).
        console.error("[v0] Error inserting waiter call:", dbError)
        return NextResponse.json({ error: "Failed to log waiter call" }, { status: 500 })
      }

      console.log(`[v0] ${tipo} logged for ${tableData.table_number} (id:${tableData.id}) at ${ts.toISOString()}`)

      return NextResponse.json(
        {
          success: true,
          message: type === "call_waiter" ? "Waiter has been notified" : "Bill request sent to staff",
          type,
          tableNumber: tableData.table_number,
        },
        { status: 201 },
      )
    }

    // === rate_service: guarda valoración del usuario ===
    if (type === "rate_service") {
      const val = Number(rating)

      if (!Number.isFinite(val) || val < 1 || val > 5) {
        return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
      }

      // 1) Localiza la mesa como ya haces en los otros casos
      const supabase = createServiceClient()
      const { std, numberOnly } = normalizeTableLabel(tableNumber)

      let { data: tableData } = await supabase
        .from("tables")
        .select("id, table_number, is_active")
        .eq("table_number", std)
        .maybeSingle()

      if (!tableData) {
        const res2 = await supabase
          .from("tables")
          .select("id, table_number, is_active")
          .eq("table_number", numberOnly)
          .maybeSingle()
        tableData = res2.data ?? null
      }

      if (!tableData) {
        const msg = userMsg(language, "TABLE_NOT_FOUND", std)
        console.warn(`[v0] Table not found for rating: "${std}" → masking as 200`)
        return NextResponse.json(
          {
            success: true,
            message: msg,
            type: "rate_service",
            tableNumber: std,
          },
          { status: 200 },
        )
      }
      if (tableData.is_active === false) {
        const msg = userMsg(language, "TABLE_INACTIVE", tableData.table_number)
        console.warn(`[v0] Table inactive for rating: "${tableData.table_number}" → masking as 200`)
        return NextResponse.json(
          {
            success: true,
            message: msg,
            type: "rate_service",
            tableNumber: tableData.table_number,
          },
          { status: 200 },
        )
      }

      // user_number is assigned automatically by the trigger_assign_user_number trigger
      const { error: rateErr } = await supabase.from("simple_ratings").insert({
        table_id: tableData.id,
        rating: val,
      })

      if (rateErr) {
        console.error("[v0] Error inserting rating:", rateErr)
        return NextResponse.json(
          {
            success: true,
            message: "No pudimos registrar tu valoración. Intenta de nuevo o avisa al personal.",
            type: "rate_service",
            tableNumber: tableData.table_number,
          },
          { status: 200 },
        )
      }

      console.log(`[v0] Rating ${val}/5 guardado para ${tableData.table_number} (table_id: ${tableData.id})`)

      return NextResponse.json(
        {
          success: true,
          message: "¡Gracias por tu valoración!",
          type: "rate_service",
          tableNumber: tableData.table_number,
          rating: val,
        },
        { status: 201 },
      )
    }

    return NextResponse.json({ error: "Invalid service request type" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Service request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
