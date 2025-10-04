import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production" && !request.headers.get("user-agent")?.includes("Mozilla")) {
    // During build, return a simple response instead of SSE
    return new Response("Build mode - SSE disabled", { status: 200 })
  }

  const responseStream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: "connected", message: "Menu updates connected" })}\n\n`
      controller.enqueue(encoder.encode(data))

      const interval = setInterval(() => {
        try {
          const updates = {
            type: "menu_update",
            timestamp: new Date().toISOString(),
            changes: [
              {
                dishId: "featured-paella",
                field: "available",
                value: Math.random() > 0.3,
              },
            ],
          }

          const data = `data: ${JSON.stringify(updates)}\n\n`
          controller.enqueue(encoder.encode(data))
        } catch (error) {
          console.error("SSE error:", error)
          clearInterval(interval)
          controller.close()
        }
      }, 30000)

      const buildTimeout = setTimeout(() => {
        clearInterval(interval)
        controller.close()
      }, 5000) // Close after 5 seconds during build

      // Cleanup on connection close
      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
        clearTimeout(buildTimeout)
        controller.close()
      })
    },
  })

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  })
}
