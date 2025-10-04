"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { useTable } from "@/lib/table-context"

interface StarRatingProps {
  onRating: (rating: number) => void
  onClose: () => void
}

export default function StarRating({ onRating, onClose }: StarRatingProps) {
  const { tableNumber } = useTable()
  const [hoveredStar, setHoveredStar] = useState(0)
  const [selectedStar, setSelectedStar] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showThanks, setShowThanks] = useState(false)

  const handleStarClick = async (rating: number) => {
    if (isProcessing) return

    setSelectedStar(rating)
    setIsProcessing(true)

    try {
      const response = await fetch("/api/service-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "rate_service",
          tableNumber: tableNumber,
          language: "es",
          rating: rating,
          timestamp: Date.now(),
        }),
      })

      if (response.ok) {
        console.log("[v0] Rating sent to server successfully:", rating)
      } else {
        console.error("[v0] Error response from server:", await response.text())
      }
    } catch (error) {
      console.error("[v0] Error sending rating to server:", error)
    }

    setShowThanks(true)

    setTimeout(() => {
      const googleReviewsUrl = "https://search.google.com/local/writereview?placeid=ChIJ-z91PXUmQg0R7PD6xLl9Gjo"
      window.open(googleReviewsUrl, "_blank")

      // Close modal after redirect
      setTimeout(() => {
        onClose()
      }, 500)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
        {!showThanks ? (
          <>
            <h3 className="text-lg font-semibold text-center mb-2">Valorar el servicio</h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Selecciona las estrellas para valorar tu experiencia
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => !isProcessing && setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  disabled={isProcessing}
                  className={`p-1 transition-transform hover:scale-110 ${isProcessing ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredStar || selectedStar) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <div className="flex justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${star <= selectedStar ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">¡Gracias por tu valoración!</h3>
              <p className="text-sm text-gray-600 mb-2">Tu opinión es muy importante para nosotros</p>
              <p className="text-xs text-gray-500">
                Te redirigiremos a Google Reviews para que puedas compartir tu experiencia públicamente
              </p>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
