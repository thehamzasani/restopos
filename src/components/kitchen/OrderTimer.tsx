"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Clock } from "lucide-react"

interface OrderTimerProps {
  createdAt: Date | string
}

export function OrderTimer({ createdAt }: OrderTimerProps) {
  const [timeAgo, setTimeAgo] = useState("")
  const [minutesAgo, setMinutesAgo] = useState(0)

  useEffect(() => {
    const updateTimer = () => {
      const date = new Date(createdAt)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const minutes = Math.floor(diffMs / 60000)
      
      setMinutesAgo(minutes)
      setTimeAgo(formatDistanceToNow(date, { addSuffix: true }))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [createdAt])

  // Color based on time
  const getColorClass = () => {
    if (minutesAgo < 10) return "text-green-600 bg-green-50"
    if (minutesAgo < 20) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${getColorClass()}`}>
      <Clock className="h-3 w-3" />
      <span>{minutesAgo}m</span>
    </div>
  )
}