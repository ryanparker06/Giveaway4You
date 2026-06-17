"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/glow-card"
import { Gift, Users, Flag, Trash2, AlertTriangle, PlusCircle, Calendar, Hash, Trophy, Sparkles } from "lucide-react"
import { endGiveaway, cancelGiveaway } from "@/lib/api-client"
import { useDashboard } from "@/contexts/dashboard-context"
import { RefreshButton } from "@/components/refresh-button"

export default function ActiveGiveawaysPage() {
  const { guildId, activeGiveaways, giveawaysMissing, refreshGiveaways } = useDashboard()

  // Track giveaways being removed for instant UI feedback
  const [removedIds, setRemovedIds] = useState<string[]>([])
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Filter to only show truly active giveaways (not ended, cancelled, removed,
  // or scheduled for a future start that hasn't begun yet)
  const now = Date.now()
  const displayGiveaways = activeGiveaways.filter((g) => {
    if (g.status === "ended" || g.status === "cancelled" || g.endedAt) return false
    if (removedIds.includes(g.id)) return false
    // Hide scheduled giveaways until they actually start
    if (g.status === "scheduled") return false
    if (g.startedAt) {
      const start = new Date(g.startedAt).getTime()
      if (!Number.isNaN(start) && start > now) return false
    }
    return true
  })

  async function handleEndGiveaway(giveawayId: string) {
    setProcessingId(giveawayId)
    // Optimistically remove from the list immediately
    setRemovedIds((prev) => [...prev, giveawayId])
    const result = await endGiveaway(guildId, giveawayId)
    if (result.success) {
      await refreshGiveaways()
    } else {
      // Restore on failure
      setRemovedIds((prev) => prev.filter((id) => id !== giveawayId))
      alert(result.error || "Failed to End Giveaway")
    }
    setProcessingId(null)
  }

  async function handleCancelGiveaway(giveawayId: string) {
    setProcessingId(giveawayId)
    // Optimistically remove from the list immediately
    setRemovedIds((prev) => [...prev, giveawayId])
    const result = await cancelGiveaway(guildId, giveawayId)
    if (result.success) {
      await refreshGiveaways()
    } else {
      // Restore on failure
      setRemovedIds((prev) => prev.filter((id) => id !== giveawayId))
      alert(result.error || "Failed to Cancel Giveaway")
    }
    setProcessingId(null)
  }

  function formatTimeRemaining(endsAt: string) {
    const now = new Date()
    const end = new Date(endsAt)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return "Ending..."
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}D ${hours}H`
    if (hours > 0) return `${hours}H ${minutes}M`
    return `${minutes}M`
  }

  function formatDateTime(value?: string) {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  // Returns elapsed percentage (0-100) between start and end
  function getProgress(startedAt?: string, endsAt?: string) {
    if (!startedAt || !endsAt) return null
    const start = new Date(startedAt).getTime()
    const end = new Date(endsAt).getTime()
    const now = Date.now()
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null
    const pct = ((now - start) / (end - start)) * 100
    return Math.min(100, Math.max(0, pct))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center animate-fade-up">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Active Giveaways</h1>
            {displayGiveaways.length > 0 && (
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-sm font-semibold text-primary">
                {displayGiveaways.length}
              </span>
            )}
          </div>
          <p className="mt-1 text-muted-foreground">Manage your running giveaways</p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton onRefresh={refreshGiveaways} className="h-9 px-3" />
          <Link href={`/dashboard/${guildId}/create`}>
            <Button className="bg-primary text-primary-foreground shadow-[0_0_20px_-4px_rgba(34,197,94,0.4)] hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Giveaway
            </Button>
          </Link>
        </div>
      </div>

      {/* Warning */}
      {giveawaysMissing && (
        <GlowCard className="bg-yellow-500/5 border-yellow-500/30 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
            <p className="text-sm text-yellow-500">Some API Endpoints Are Not Implemented Yet.</p>
          </div>
        </GlowCard>
      )}

      {/* Empty State */}
      {displayGiveaways.length === 0 ? (
        <GlowCard className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Active Giveaways</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create a Giveaway From the Dashboard or Use /giveaway-start in Discord
          </p>
          <Link href={`/dashboard/${guildId}/create`}>
            <Button className="bg-primary hover:bg-primary/90">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Giveaway
            </Button>
          </Link>
        </GlowCard>
      ) : (
        <div className="flex flex-col gap-3 stagger">
          {displayGiveaways.map((giveaway) => {
            const winnerCount = giveaway.winnerCount || giveaway.winners || 1
            const prize = giveaway.prize || "Untitled Giveaway"
            const startLabel = formatDateTime(giveaway.startedAt || giveaway.scheduledStart)
            const progress = getProgress(giveaway.startedAt || giveaway.scheduledStart, giveaway.endsAt)
            const bonusEntries = (giveaway.bonusEntries || []).filter((b) => b.roleId)
            const requiredRoles = giveaway.requiredRoles || []
            return (
            <GlowCard key={giveaway.id} interactive className="overflow-hidden p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Main content */}
                <div className="flex min-w-0 flex-1 flex-col gap-4 p-5">
                  {/* Prize + Channel */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-4 text-sm">
                      <Gift className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">Name:</span>
                      <span className="ml-auto truncate font-medium text-foreground">{prize}</span>
                    </div>
                    {giveaway.channelId && (
                      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-4 text-sm">
                        <Hash className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">Channel:</span>
                        <span className="ml-auto truncate font-mono text-foreground">{giveaway.channelId}</span>
                      </div>
                    )}
                  </div>

                  {/* Meta info */}
                  <div className="grid grid-cols-1 gap-2.5 rounded-xl border border-border/60 bg-secondary/20 p-4 sm:grid-cols-2">
                    {giveaway.hostId && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">Host:</span>
                        <span className="ml-auto truncate font-mono text-foreground">{giveaway.hostId}</span>
                      </div>
                    )}
                    {startLabel && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">Started:</span>
                        <span className="ml-auto truncate font-medium text-foreground">{startLabel}</span>
                      </div>
                    )}
                    {typeof giveaway.requiredLevel === "number" && giveaway.requiredLevel > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">Required Level:</span>
                        <span className="ml-auto font-medium text-foreground">{giveaway.requiredLevel}+</span>
                      </div>
                    )}
                  </div>

                  {/* Required roles */}
                  {requiredRoles.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Required Roles
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {requiredRoles.map((role) => (
                          <span
                            key={role}
                            className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs text-foreground"
                          >
                            @{role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bonus entry roles */}
                  {bonusEntries.length > 0 && (
                    <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-3">
                      <div className="mb-2 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[11px] font-medium uppercase tracking-wide text-primary">
                          Bonus Entry Roles
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {bonusEntries.map((bonus) => (
                          <div
                            key={bonus.roleId}
                            className="flex items-center justify-between gap-3 rounded-lg bg-background/40 px-3 py-2"
                          >
                            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground">
                              <Users className="h-3.5 w-3.5 text-primary" />
                              @{bonus.roleId}
                            </span>
                            <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                              +{bonus.entries} extra {bonus.entries === 1 ? "entry" : "entries"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats panel */}
                <div className="flex shrink-0 flex-col justify-center gap-4 border-t border-border/60 bg-secondary/20 p-5 lg:w-96 lg:border-l lg:border-t-0">
                  <div className="flex items-stretch gap-4">
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-border bg-background px-4 py-3 text-center shadow-sm">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Winners</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{winnerCount}</p>
                    </div>

                    <div className="flex flex-[1.6] flex-col items-center justify-center rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-center">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-primary/80">Ends In</p>
                      <p className="mt-1 whitespace-nowrap text-2xl font-bold tabular-nums text-primary">
                        {formatTimeRemaining(giveaway.endsAt)}
                      </p>
                    </div>
                  </div>

                  {progress !== null && (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                </div>

                {/* Actions panel */}
                <div className="flex shrink-0 items-center justify-around gap-2 border-t border-border/60 p-4 lg:flex-col lg:items-stretch lg:justify-center lg:border-l lg:border-t-0">
                  <button
                    type="button"
                    onClick={() => handleEndGiveaway(giveaway.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 lg:flex-none"
                  >
                    <Flag className="h-4 w-4" />
                    End Now
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancelGiveaway(giveaway.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 lg:flex-none"
                  >
                    <Trash2 className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </GlowCard>
          )})}
        </div>
      )}
    </div>
  )
}
