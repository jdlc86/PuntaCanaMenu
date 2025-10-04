"use client"

import { useState, useEffect, useRef } from "react"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DishImageCarouselProps {
  images: string[]
  alt: string
  className?: string
  autoScrollInterval?: number
}

export default function DishImageCarousel({
  images,
  alt,
  className,
  autoScrollInterval = 3000,
}: DishImageCarouselProps) {
  const [api, setApi] = useState<any>()
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!api || images.length <= 1) return

    const startAutoScroll = () => {
      if (intervalRef.current) clearInterval(intervalRef.current)

      if (!isPaused) {
        intervalRef.current = setInterval(() => {
          api.scrollNext()
        }, autoScrollInterval)
      }
    }

    const stopAutoScroll = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
      }
    }

    startAutoScroll()

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })

    return () => stopAutoScroll()
  }, [api, isPaused, autoScrollInterval, images.length])

  const handleInteraction = () => {
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 5000)
  }

  const goToPrevious = () => {
    if (api) {
      api.scrollPrev()
      handleInteraction()
    }
  }

  const goToNext = () => {
    if (api) {
      api.scrollNext()
      handleInteraction()
    }
  }

  if (images.length === 1) {
    return (
      <div className={cn("w-full h-full", className)}>
        <img
          src={images[0] || "/placeholder.svg?height=320&width=600"}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className={cn("relative w-full h-full group", className)}>
      <Carousel
        setApi={setApi}
        className="w-full h-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="h-full">
          {images.map((image, index) => (
            <CarouselItem key={index} className="h-full">
              <div
                className="w-full h-full cursor-pointer"
                onClick={handleInteraction}
                onTouchStart={handleInteraction}
              >
                <img
                  src={image || "/placeholder.svg?height=320&width=600"}
                  alt={`${alt} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white border-none hover:bg-black/70 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white border-none hover:bg-black/70 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn("w-2 h-2 rounded-full transition-all", current === index ? "bg-white" : "bg-white/50")}
              onClick={() => {
                api?.scrollTo(index)
                handleInteraction()
              }}
            />
          ))}
        </div>
      </Carousel>
    </div>
  )
}
