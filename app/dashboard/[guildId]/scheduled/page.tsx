"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/glow-card"
  import { Clock, Gift, Calendar, MoreVertical, Trash2, Pencil, Copy, AlertTriangle, PlusCircle, Crown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cancelGiveaway } from "@/lib/api-client"
import { useDashboard } from "@/contexts/dashboard-context"
import { RefreshButton } from "@/components/refresh-button"

export default function ScheduledGiveawaysPage() {
  const router = useRouter()
  const { guildId, scheduledGiveaways, scheduledMissing, refreshScheduled, isPremium } = useDashboard()

  // These come from the scheduled endpoint, so the bot already removes a
  // giveaway from this list once it starts. We additionally drop anything
  // explicitly ended/cancelled, or whose start time has already passed.
  // NOTE: don't filter on status === "active" here — mapGiveaway defaults a
  // missing status to "active", which would wrongly hide valid scheduled ones.
  const upcomingGiveaways = useMemo(() => {
    const now = Date.now()
    return scheduledGiveaways.filter((g) => {
      if (g.status === "ended" || g.status === "cancelled") return false
      // If its scheduled start time has already passed, it has started
      const startsAt = g.scheduledStart || g.startedAt
      if (startsAt) {
        const start = new Date(startsAt).getTime()
        if (!Number.isNaN(start) && start <= now) return false
      }
      // Safety net: hide ones whose end time is already in the past
      const endsAt = g.endsAt ? new Date(g.endsAt).getTime() : null
      if (endsAt !== null && !Number.isNaN(endsAt) && endsAt <= now) return false
      return true
    })
  }, [scheduledGiveaways])

  // Auto-refresh so the bot's status changes (a giveaway starting or ending)
  // are reflected here, and ended giveaways disappear without a manual refresh.
  useEffect(() => {
    const interval = setInterval(() => {
      refreshScheduled()
    }, 30000)

    return () => clearInterval(interval)
  }, [refreshScheduled])

  async function handleCancelGiveaway(giveawayId: string) {
    if (!confirm("Are You Sure You Want to Cancel This Scheduled Giveaway?")) return
    const result = await cancelGiveaway(guildId, giveawayId)
    if (result.success) {
      refreshScheduled()
    } else {
      alert(result.error || "Failed to cancel giveaway")
    }
  }

  function formatStartTime(startTime?: string) {
    if (!startTime) return "Start time not set"
    const date = new Date(startTime)
    if (Number.isNaN(date.getTime())) return "Start time not set"
    return date.toLocaleString(undefined, { 
      month: "short", 
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })
  }

  function formatTimeUntilStart(startTime?: string) {
    if (!startTime) return "Pending"
    const start = new Date(startTime)
    if (Number.isNaN(start.getTime())) return "Pending"
    const now = new Date()
    const diff = start.getTime() - now.getTime()
    
    if (diff <= 0) return "Starting soon"
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `Starts in ${days}d ${hours}h`
    if (hours > 0) return `Starts in ${hours}h ${minutes}m`
    return `Starts in ${minutes}m`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center animate-fade-up">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Scheduled Giveaways</h1>
              {upcomingGiveaways.length > 0 && (
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-sm font-semibold text-primary">
                  {upcomingGiveaways.length}
                </span>
              )}
            </div>
            <p className="text-muted-foreground">Upcoming giveaways waiting to start</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton onRefresh={refreshScheduled} />
          {isPremium && (
            <Link href={`/dashboard/${guildId}/create`}>
              <Button className="bg-primary text-primary-foreground shadow-[0_0_20px_-4px_rgba(34,197,94,0.4)] hover:bg-primary/90">
                <PlusCircle className="mr-2 h-4 w-4" />
                Schedule New
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Warning */}
      {scheduledMissing && (
        <GlowCard className="bg-yellow-500/5 border-yellow-500/30 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
            <p className="text-sm text-yellow-500">Some API Endpoints Are Not Implemented Yet.</p>
          </div>
        </GlowCard>
      )}

      {/* Empty State */}
      {upcomingGiveaways.length === 0 ? (
        <GlowCard className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">No Scheduled Giveaways</h3>
          <p className="mx-auto mb-6 max-w-md text-muted-foreground">
            {isPremium 
              ? "Schedule a giveaway from the dashboard or use /giveaway-schedule in Discord"
              : "Upgrade to Premium to schedule giveaways in advance"
            }
          </p>
          {isPremium ? (
            <Link href={`/dashboard/${guildId}/create`}>
              <Button className="bg-primary hover:bg-primary/90">
                <PlusCircle className="h-4 w-4 mr-2" />
                Schedule Giveaway
              </Button>
            </Link>
          ) : (
            <Link href={`/dashboard/${guildId}/premium`}>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </Link>
          )}
        </GlowCard>
      ) : (
        <div className="flex flex-col gap-3 stagger">
          {upcomingGiveaways.map((giveaway) => (
            <GlowCard key={giveaway.id} interactive className="p-4">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                  <Gift className="h-6 w-6 text-primary" />
                </div>

                {/* Prize + status */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-semibold leading-tight text-foreground truncate">{giveaway.prize}</h3>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary shrink-0">
                      <Clock className="h-3 w-3" />
                      Scheduled
                    </span>
                  </div>
                  {giveaway.description && (
                    <p className="mt-1 text-sm text-muted-foreground truncate">{giveaway.description}</p>
                  )}
                </div>

                {/* Inline stats */}
                <div className="hidden md:flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <div className="mb-0.5 flex items-center justify-center gap-1.5 text-muted-foreground">
                      <Gift className="h-3.5 w-3.5" />
                      <span className="text-[11px] uppercase tracking-wide">Winners</span>
                    </div>
                    <p className="font-semibold text-foreground text-sm tabular-nums">{giveaway.winnerCount}</p>
                  </div>
                  <div className="text-center">
                    <div className="mb-0.5 flex items-center justify-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-[11px] uppercase tracking-wide">Starts</span>
                    </div>
                    <p className="font-semibold text-foreground text-sm">{formatStartTime(giveaway.scheduledStart || giveaway.startedAt)}</p>
                  </div>
                  <div className="text-center min-w-20">
                    <div className="mb-0.5 flex items-center justify-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-[11px] uppercase tracking-wide">Countdown</span>
                    </div>
                    <p className="font-semibold text-primary text-sm">{formatTimeUntilStart(giveaway.scheduledStart || giveaway.startedAt)}</p>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 shrink-0 p-0 text-muted-foreground hover:bg-secondary hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <Link href={`/dashboard/${guildId}/giveaways/${giveaway.id}/edit`}>
                      <DropdownMenuItem className="cursor-pointer">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem 
                      onClick={() => router.push(`/dashboard/${guildId}/create?duplicate=${giveaway.id}`)}
                      className="cursor-pointer"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleCancelGiveaway(giveaway.id)}
                      className="cursor-pointer text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile stats row */}
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 md:hidden">
                <div className="text-center">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Winners</p>
                  <p className="font-semibold text-foreground text-sm tabular-nums">{giveaway.winnerCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Starts</p>
                  <p className="font-semibold text-foreground text-sm">{formatStartTime(giveaway.scheduledStart || giveaway.startedAt)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Countdown</p>
                  <p className="font-semibold text-primary text-sm">{formatTimeUntilStart(giveaway.scheduledStart || giveaway.startedAt)}</p>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      )}
    </div>
  )
}
