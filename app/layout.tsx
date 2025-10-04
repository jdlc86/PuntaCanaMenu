import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/lib/cart-context"
import { TableProvider } from "@/lib/table-context"
import { RestaurantConfigProvider } from "@/lib/restaurant-config-context"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import OfflineIndicator from "@/components/offline-indicator"
import "./globals.css"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body>
        <RestaurantConfigProvider>
          <TableProvider>
            <CartProvider>
              <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                <Suspense fallback={null}>
                  <OfflineIndicator />
                  {children}
                  <Toaster />
                </Suspense>
              </ThemeProvider>
            </CartProvider>
          </TableProvider>
        </RestaurantConfigProvider>
        <Analytics />
      </body>
    </html>
  )
}
