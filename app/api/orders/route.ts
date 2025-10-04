import { NextResponse } from "next/server"
import { extractToken, validateTableToken } from "@/lib/jwt"
import { createServiceClient } from "@/lib/supabase/server"

async function generateOrderNumber(orderType: "R" | "O" | "C", supabase: any): Promise<string> {
  // Get current date in DD.MM.YY format
  const now = new Date()
  const day = now.getDate().toString().padStart(2, "0")
  const month = (now.getMonth() + 1).toString().padStart(2, "0")
  const year = now.getFullYear().toString().slice(-2)
  const dateStr = `${day}.${month}.${year}`

  // Get start and end of today for querying
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  // Query orders from today to find the highest sequential number
  const { data: todayOrders, error } = await supabase
    .from("orders")
    .select("order_number")
    .gte("created_at", startOfDay.toISOString())
    .lte("created_at", endOfDay.toISOString())
    .like("order_number", `${orderType}%`)

  if (error) {
    console.error("[v0] Error querying today's orders:", error)
    const randomSuffix = generateRandomSuffix()
    return `${orderType}${Date.now()}/${dateStr}/${randomSuffix}`
  }

  // Extract sequential numbers from today's orders
  let maxSequential = 0
  if (todayOrders && todayOrders.length > 0) {
    for (const order of todayOrders) {
      const parts = order.order_number.split("/")
      if (parts.length >= 1) {
        // Extract sequential number from first part (e.g., "R1" -> 1)
        const firstPart = parts[0]
        const seqMatch = firstPart.match(/\d+/)
        if (seqMatch) {
          const seq = Number.parseInt(seqMatch[0])
          if (!Number.isNaN(seq) && seq > maxSequential) {
            maxSequential = seq
          }
        }
      }
    }
  }

  // Increment sequential number
  const nextSequential = maxSequential + 1

  const randomSuffix = generateRandomSuffix()

  return `${orderType}${nextSequential}/${dateStr}/${randomSuffix}`
}

function generateRandomSuffix(): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let result = ""
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: Request) {
  try {
    console.log("[v0] Orders API: Request received")
    const body = await request.json()
    console.log("[v0] Orders API: Body parsed:", JSON.stringify(body, null, 2))

    if (body.function === "createOrder") {
      const supabase = createServiceClient()

      const [orderData] = body.parameters || []
      console.log("[v0] Orders API: Order data:", JSON.stringify(orderData, null, 2))

      if (!orderData) {
        return NextResponse.json(
          {
            ok: false,
            message: "Order data is required",
          },
          { status: 400 },
        )
      }

      const tokenFromHeader = extractToken(request)
      const tokenFromBody = orderData.meta?.token
      const token = tokenFromHeader || tokenFromBody

      console.log("[v0] Orders API: Token from Authorization header:", tokenFromHeader ? "present" : "missing")
      console.log("[v0] Orders API: Token from body meta:", tokenFromBody ? "present" : "missing")
      console.log("[v0] Orders API: Using token:", token ? "present" : "missing")
      console.log("[v0] Orders API: JWT_SECRET configured:", process.env.JWT_SECRET ? "yes" : "no")
      console.log("[v0] Orders API: NEXT_PUBLIC_REQUIRE_JWT:", process.env.NEXT_PUBLIC_REQUIRE_JWT)

      let orderType: "R" | "O" | "C" = "R" // Default to Restaurant
      let tableId: number | null = null

      if (token) {
        console.log("[v0] Orders API: Validating token...")
        const validation = await validateTableToken(token)
        console.log("[v0] Orders API: Token validation result:", JSON.stringify(validation, null, 2))

        if (!validation.valid) {
          console.error("[v0] Orders API: Invalid table token:", validation.error)
          return NextResponse.json(
            {
              ok: false,
              message: "Invalid or expired table token",
              error: validation.error,
            },
            { status: 401 },
          )
        }

        const tokenTableId = validation.payload?.table_id
        const requestTableId = orderData.meta?.table
        console.log("[v0] Orders API: Token table_id:", tokenTableId)
        console.log("[v0] Orders API: Request table:", requestTableId)

        // Verify table number matches token
        if (validation.payload && requestTableId !== tokenTableId) {
          console.error("[v0] Orders API: Table number mismatch - token:", tokenTableId, "request:", requestTableId)
          return NextResponse.json(
            {
              ok: false,
              message: "Table number mismatch",
              details: `Token is for table ${tokenTableId}, but request is for table ${requestTableId}`,
            },
            { status: 403 },
          )
        }

        if (validation.payload) {
          orderType = validation.payload.order_type
          console.log("[v0] Orders API: Order type from token:", orderType)

          const tableIdFromToken = validation.payload.table_id
          const possibleFormats = [
            `Mesa: ${tableIdFromToken}`, // "Mesa: 5"
            `Mesa ${tableIdFromToken}`, // "Mesa 5"
            `${tableIdFromToken}`, // "5"
            `Table ${tableIdFromToken}`, // "Table 5"
            `Table: ${tableIdFromToken}`, // "Table: 5"
          ]

          console.log("[v0] Orders API: Trying to find table with ID:", tableIdFromToken)
          console.log("[v0] Orders API: Will try formats:", possibleFormats)

          let tableResult = null
          let tableError = null

          // Try each format until we find a match
          for (const format of possibleFormats) {
            console.log("[v0] Orders API: Trying format:", format)
            const { data, error } = await supabase
              .from("tables")
              .select("id, table_number, is_active")
              .eq("table_number", format)
              .eq("is_active", true)
              .maybeSingle()

            if (data) {
              console.log("[v0] Orders API: Found table with format:", format, "Result:", data)
              tableResult = data
              break
            } else if (error) {
              console.log("[v0] Orders API: Error with format:", format, "Error:", error)
              tableError = error
            } else {
              console.log("[v0] Orders API: No match for format:", format)
            }
          }

          // If still not found, try to list all tables to help debug
          if (!tableResult) {
            console.log("[v0] Orders API: Table not found with any format. Listing all active tables...")
            const { data: allTables, error: listError } = await supabase
              .from("tables")
              .select("id, table_number, is_active")
              .eq("is_active", true)
              .limit(10)

            if (listError) {
              console.error("[v0] Orders API: Error listing tables:", listError)
            } else {
              console.log("[v0] Orders API: Active tables in database:", JSON.stringify(allTables, null, 2))
            }

            console.error("[v0] Orders API: Table not found in database - rejecting order")
            console.error("[v0] Orders API: Token table_id:", tableIdFromToken)
            console.error("[v0] Orders API: Tried formats:", possibleFormats)
            console.error(
              "[v0] Orders API: This indicates a mismatch between JWT table_id and database table_number format",
            )
            return NextResponse.json(
              {
                ok: false,
                message: "Mesa no encontrada",
                error:
                  "La mesa especificada no existe en el sistema. Por favor, consulte con el personal del restaurante.",
              },
              { status: 404 },
            )
          } else {
            tableId = tableResult.id
            console.log(
              "[v0] Orders API: Order validated for table:",
              tableIdFromToken,
              "Type:",
              orderType,
              "Table ID:",
              tableId,
            )
          }
        }
      } else {
        console.warn("[v0] Orders API: Order submitted without token (development mode)")
        console.warn("[v0] Orders API: This should only happen in development with NEXT_PUBLIC_REQUIRE_JWT=false")

        if (orderData.meta?.table) {
          const tableNumber = `Mesa: ${orderData.meta.table}`
          console.log("[v0] Orders API: Looking up table in development mode:", tableNumber)

          const { data: tableResult } = await supabase
            .from("tables")
            .select("id, table_number, is_active")
            .eq("table_number", tableNumber)
            .eq("is_active", true)
            .maybeSingle()

          if (tableResult) {
            tableId = tableResult.id
            console.log("[v0] Orders API: Found table in development mode:", tableId)
          } else {
            console.warn("[v0] Orders API: Table not found in development mode:", tableNumber)
            console.warn("[v0] Orders API: Available tables should be checked in database")
          }
        }
      }

      if (!tableId) {
        console.error("[v0] Orders API: Cannot create order without valid table ID")
        console.error("[v0] Orders API: Token present:", token ? "yes" : "no")
        console.error("[v0] Orders API: Order data table:", orderData.meta?.table)
        return NextResponse.json(
          {
            ok: false,
            message: "Mesa requerida",
            error:
              "No se puede crear un pedido sin una mesa válida. Por favor, consulte con el personal del restaurante.",
          },
          { status: 400 },
        )
      }

      const orderId = await generateOrderNumber(orderType, supabase)
      const serverTotal = orderData.totalClient

      try {
        console.log("[v0] Inserting order:", {
          orderId,
          tableId,
          customerName: orderData.meta?.customerName,
          subtotal: orderData.meta?.subtotal || serverTotal,
          tip: orderData.tip || 0,
          tipAmount: orderData.meta?.tipAmount || 0,
          total: serverTotal,
        })

        const { data: orderResult, error: orderError } = await supabase
          .from("orders")
          .insert({
            order_number: orderId,
            table_id: tableId,
            customer_name: orderData.meta?.customerName || null,
            subtotal: orderData.meta?.subtotal || serverTotal,
            tip_percentage: orderData.tip || 0,
            tip_amount: orderData.meta?.tipAmount || 0,
            total: serverTotal,
            confirmation_method: orderData.meta?.confirmationMethod || "mesa",
            status: "pending",
          })
          .select("id")
          .single()

        if (orderError || !orderResult) {
          console.error("[v0] Error inserting order:", orderError)
          throw new Error(orderError?.message || "Failed to insert order")
        }

        const dbOrderId = orderResult.id
        console.log("[v0] Order inserted with ID:", dbOrderId)

        // Insert order items
        if (orderData.cart && Array.isArray(orderData.cart)) {
          console.log("[v0] Cart items to insert:", JSON.stringify(orderData.cart, null, 2))

          for (const item of orderData.cart) {
            const menuItemId = typeof item.id === "string" ? Number.parseInt(item.id) : item.id
            const quantity = item.q || 1

            let unitPrice = 0
            if (typeof item.unitPrice === "number" && !isNaN(item.unitPrice)) {
              unitPrice = item.unitPrice
            } else if (item.p && Array.isArray(item.p) && item.p.length > 0) {
              // Sum all prices in the array (base + personalizations)
              unitPrice = item.p.reduce((sum, priceItem) => {
                const price = priceItem[1] || 0
                return sum + price
              }, 0)
            }

            const subtotal = unitPrice * quantity
            const dishName = item.p?.[0]?.[0] || "Unknown"

            console.log("[v0] Inserting order item:", {
              menuItemId,
              dishName,
              quantity,
              unitPrice,
              subtotal,
              variant: item.v,
              note: item.note,
              specialNote: item.specialNote,
            })

            const customizations: any = {}
            if (item.v) {
              customizations.variant = item.v
            }
            if (item.p && item.p.length > 1) {
              // Store personalizations (skip first item which is the base dish)
              customizations.personalizations = item.p.slice(1).map(([name, price]) => ({
                name,
                price,
              }))
            }

            const { error: itemError } = await supabase.from("order_items").insert({
              order_id: dbOrderId,
              menu_item_id: menuItemId,
              dish_name: dishName,
              quantity: quantity,
              unit_price: unitPrice,
              subtotal: subtotal,
              notes: item.note || null,
              variants: item.v || null,
              customizations: Object.keys(customizations).length > 0 ? JSON.stringify(customizations) : null,
            })

            if (itemError) {
              console.error("[v0] Error inserting order item:", itemError)
              throw new Error(itemError.message)
            }

            console.log("[v0] Order item inserted successfully for dish:", dishName)
          }
        }

        console.log("[v0] Order saved to database:", orderId, "DB ID:", dbOrderId)

        return NextResponse.json({
          ok: true,
          orderId,
          dbOrderId,
          serverTotal,
          modifyUrl: `https://example.com/modify/${orderId}`,
        })
      } catch (dbError) {
        console.error("[v0] Database error saving order:", dbError)
        return NextResponse.json(
          {
            ok: false,
            message: "Failed to save order to database",
            error: dbError instanceof Error ? dbError.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ error: "Function not found" }, { status: 404 })
  } catch (error) {
    console.error("[v0] Error in orders API:", error)
    return NextResponse.json(
      {
        ok: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
