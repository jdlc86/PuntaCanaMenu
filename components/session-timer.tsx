"use client"

import { Clock } from "lucide-react"
import { useTable } from "@/lib/table-context"
import { useI18n, type Locale } from "@/lib/i18n"

interface SessionTimerProps {
  language: Locale
}

export default function SessionTimer({ language }: SessionTimerProps) {
  const { timeRemaining, orderType, isSessionExpired } = useTable()
  const { t } = useI18n(language)

  if (orderType !== "R" && orderType !== "O") {
    return null
  }

  // Don't show if no time remaining data
  if (timeRemaining === null) {
    return null
  }

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gray-100 text-gray-600 transition-all duration-300"
      title={t("timeRemaining")}
    >
      <Clock className="h-4 w-4" />
      <span className="text-sm font-mono font-medium tabular-nums">
        {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  )
}
