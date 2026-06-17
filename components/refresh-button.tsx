"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface RefreshButtonProps {
  onRefresh: () => void | Promise<void>
  className?: string
  showLabel?: boolean
  label?: string
}

export function RefreshButton({
  onRefresh,
  className,
  showLabel = true,
  label = "Refresh",
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function handleClick() {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      // Ensure the spin is visible even if the refresh resolves instantly
      await Promise.all([
        Promise.resolve(onRefresh()),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ])
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isRefreshing}
      variant="outline"
      className={cn("border-primary/50 hover:bg-primary/10", className)}
    >
      <RefreshCw className={cn("h-4 w-4", showLabel && "mr-2", isRefreshing && "animate-spin")} />
      {showLabel && label}
    </Button>
  )
}
