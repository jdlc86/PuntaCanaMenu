"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Megaphone } from "lucide-react"

interface AnnouncementBarProps {
  language: "es" | "en" | "de" | "fr" | "zh"
}

interface Announcement {
  text: string
  priority: number
}

interface AnnouncementData {
  announcements: {
    [key: string]: Announcement[]
  }
  lastUpdated: string
}

const DEFAULT_ANNOUNCEMENTS = {
  es: [{ text: "Gracias por confiar en nosotros", priority: 0 }],
  en: [{ text: "Thank you for trusting us", priority: 0 }],
  de: [{ text: "Vielen Dank für Ihr Vertrauen", priority: 0 }],
  fr: [{ text: "Merci de nous faire confiance", priority: 0 }],
  zh: [{ text: "感谢您的信任", priority: 0 }],
}

export default function AnnouncementBar({ language }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [announcementData, setAnnouncementData] = useState<AnnouncementData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const [animationDuration, setAnimationDuration] = useState(10)
  const [needsScroll, setNeedsScroll] = useState(false)
  const [measurementComplete, setMeasurementComplete] = useState(false)
  const [animationDistance, setAnimationDistance] = useState(0)
  const textRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const getCurrentAnnouncements = useCallback((): Announcement[] => {
    if (!announcementData?.announcements) {
      return DEFAULT_ANNOUNCEMENTS[language]
    }

    const langAnnouncements = announcementData.announcements[language]

    // Validate that we have a valid array with at least one announcement
    if (!Array.isArray(langAnnouncements) || langAnnouncements.length === 0) {
      return DEFAULT_ANNOUNCEMENTS[language]
    }

    // Validate that all announcements have required properties
    const validAnnouncements = langAnnouncements.filter(
      (ann) => ann && typeof ann.text === "string" && ann.text.trim() !== "",
    )

    if (validAnnouncements.length === 0) {
      return DEFAULT_ANNOUNCEMENTS[language]
    }

    return validAnnouncements
  }, [announcementData, language])

  const handleAnimationEnd = useCallback(() => {
    const currentAnnouncements = getCurrentAnnouncements()

    const nextIndex = (currentIndex + 1) % currentAnnouncements.length
    console.log("[v0] AnnouncementBar: Moving to next announcement", {
      from: currentIndex,
      to: nextIndex,
      total: currentAnnouncements.length,
      needsScroll,
    })
    setCurrentIndex(nextIndex)
    setCycleCount((prev) => prev + 1)
  }, [currentIndex, needsScroll, getCurrentAnnouncements])

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        console.log("[v0] AnnouncementBar: Fetching announcements...")
        const response = await fetch("/api/announcements")
        if (response.ok) {
          const data = await response.json()
          console.log("[v0] AnnouncementBar: Received data:", JSON.stringify(data).substring(0, 200))
          if (data && typeof data === "object" && data.announcements) {
            setAnnouncementData(data)
          } else {
            console.warn("[v0] AnnouncementBar: Invalid data structure, using fallback")
            setAnnouncementData({
              announcements: DEFAULT_ANNOUNCEMENTS,
              lastUpdated: new Date().toISOString(),
            })
          }
        } else {
          console.log("[v0] AnnouncementBar: Response not OK, using fallback")
          setAnnouncementData({
            announcements: DEFAULT_ANNOUNCEMENTS,
            lastUpdated: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error("[v0] AnnouncementBar: Failed to fetch announcements:", error)
        setAnnouncementData({
          announcements: DEFAULT_ANNOUNCEMENTS,
          lastUpdated: new Date().toISOString(),
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncements()

    const pollInterval = setInterval(fetchAnnouncements, 30000)
    return () => clearInterval(pollInterval)
  }, [])

  useEffect(() => {
    if (!textRef.current || !containerRef.current) {
      console.log("[v0] AnnouncementBar: Skipping measurement - missing refs")
      return
    }

    const currentAnnouncements = getCurrentAnnouncements()

    if (currentIndex >= currentAnnouncements.length) {
      console.warn("[v0] AnnouncementBar: currentIndex out of bounds, resetting to 0")
      setCurrentIndex(0)
      return
    }

    setMeasurementComplete(false)

    requestAnimationFrame(() => {
      if (!textRef.current || !containerRef.current) return

      const textWidth = textRef.current.scrollWidth
      const containerWidth = containerRef.current.clientWidth

      const needsScrolling = textWidth > containerWidth

      setNeedsScroll(needsScrolling)

      if (needsScrolling) {
        const pixelsPerSecond = 80
        const totalDistance = textWidth + containerWidth
        const duration = Math.max(totalDistance / pixelsPerSecond, 5)

        setAnimationDuration(duration)
        setAnimationDistance(totalDistance)

        console.log("[v0] AnnouncementBar: Long announcement - scrolling", {
          textWidth,
          containerWidth,
          totalDistance,
          duration: duration.toFixed(2) + "s",
          currentIndex,
          cycleCount,
          announcement: currentAnnouncements[currentIndex].text.substring(0, 50) + "...",
          priority: currentAnnouncements[currentIndex].priority,
          pixelsPerSecond,
        })
      } else {
        setAnimationDuration(5)

        console.log("[v0] AnnouncementBar: Short announcement - static display", {
          textWidth,
          containerWidth,
          duration: "5s",
          currentIndex,
          cycleCount,
          announcement: currentAnnouncements[currentIndex].text,
          priority: currentAnnouncements[currentIndex].priority,
        })
      }

      setMeasurementComplete(true)
    })
  }, [language, currentIndex, cycleCount, getCurrentAnnouncements])

  useEffect(() => {
    if (timeoutRef.current) {
      console.log("[v0] AnnouncementBar: Clearing existing timeout")
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (!needsScroll && announcementData && measurementComplete) {
      console.log("[v0] AnnouncementBar: Setting 5s timeout for short announcement")
      timeoutRef.current = setTimeout(() => {
        console.log("[v0] AnnouncementBar: Timeout fired - moving to next")
        handleAnimationEnd()
      }, 5000)

      return () => {
        if (timeoutRef.current) {
          console.log("[v0] AnnouncementBar: Cleanup - clearing timeout")
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }
    }
  }, [needsScroll, announcementData, measurementComplete, handleAnimationEnd])

  if (!isVisible || isLoading || !announcementData) {
    console.log("[v0] AnnouncementBar: Not rendering", { isVisible, isLoading, hasData: !!announcementData })
    return null
  }

  const currentAnnouncements = getCurrentAnnouncements()

  const safeIndex = Math.min(currentIndex, currentAnnouncements.length - 1)
  const currentAnnouncement = currentAnnouncements[safeIndex]

  if (!currentAnnouncement || !currentAnnouncement.text) {
    console.error("[v0] AnnouncementBar: Invalid announcement at index", safeIndex)
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white h-12 px-4 shadow-md">
      <div className="flex items-center justify-center gap-2 relative z-10 h-full">
        <Megaphone className="h-4 w-4 animate-pulse flex-shrink-0" />
        <div ref={containerRef} className="flex-1 overflow-hidden">
          <div className="relative overflow-hidden">
            {needsScroll ? (
              <div
                key={`scroll-${safeIndex}-${cycleCount}`}
                className="animate-breaking-news"
                style={{
                  animationDuration: `${animationDuration}s`,
                  ["--animation-distance" as string]: `${animationDistance}px`,
                }}
                onAnimationEnd={handleAnimationEnd}
              >
                <p ref={textRef} className="text-sm font-medium whitespace-nowrap">
                  {currentAnnouncement.text}
                </p>
              </div>
            ) : (
              <div key={`static-${safeIndex}-${cycleCount}`} className="flex justify-center">
                <p ref={textRef} className="text-sm font-medium whitespace-nowrap">
                  {currentAnnouncement.text}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes breaking-news {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(calc(-1 * var(--animation-distance)));
          }
        }
        .animate-breaking-news {
          animation: breaking-news linear forwards;
        }
      `}</style>
    </div>
  )
}
