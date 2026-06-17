"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/glow-card"
  import { Gift, Crown, Calendar, PlusCircle, Clock, AlertTriangle, ArrowRight, Users, Settings } from "lucide-react"
import { useDashboard } from "@/contexts/dashboard-context"

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accentColor = "primary",
}: {
  label: string
  value: number | string
  icon: React.ElementType
  trend?: string
  accentColor?: "primary" | "yellow" | "blue"
}) {
  const colorMap = {
    primary: "bg-primary/15 text-primary",
    yellow: "bg-yellow-500/15 text-yellow-500",
    blue: "bg-blue-500/15 text-blue-500",
  }

  return (
    <GlowCard interactive className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
          {trend && <p className="mt-1 text-xs text-primary">{trend}</p>}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorMap[accentColor]} ring-1 ring-inset ring-white/5`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </GlowCard>
  )
}

export default function GuildDashboardPage() {
  const { guildId, overview, isPremium, overviewMissing, activeGiveaways } = useDashboard()

  function formatEndsIn(endsAt: string) {
    const diff = new Date(endsAt).getTime() - Date.now()
    if (Number.isNaN(diff)) return "—"
    if (diff <= 0) return "Ending..."
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">Overview</h1>
          <p className="mt-1 text-muted-foreground">Welcome back! Here&apos;s your giveaway snapshot.</p>
        </div>
        <Link href={`/dashboard/${guildId}/create`}>
          <Button className="bg-primary text-primary-foreground shadow-[0_0_20px_-4px_rgba(34,197,94,0.4)] hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Giveaway
          </Button>
        </Link>
      </div>

      {/* Warning */}
      {overviewMissing && (
        <GlowCard className="bg-yellow-500/5 border-yellow-500/30 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
            <p className="text-sm text-yellow-500">Some API Endpoints Are Not Implemented Yet.</p>
          </div>
        </GlowCard>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard 
          label="Total Giveaways" 
          value={overview?.totalGiveaways || 0}
          icon={Gift}
        />
        <StatCard 
          label="Active" 
          value={overview?.activeGiveaways || 0}
          icon={Clock}
          accentColor="primary"
        />
        <StatCard 
          label="Completed" 
          value={overview?.completedGiveaways || 0}
          icon={Users}
          accentColor="blue"
        />
        <StatCard 
          label="Premium" 
          value={isPremium ? "Active" : "Free"}
          icon={Crown}
          accentColor="yellow"
        />
      </div>

      {/* Premium Expiry */}
      {isPremium && overview?.premiumExpiry && (
        <GlowCard className="bg-yellow-500/5 border-yellow-500/30 p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-yellow-500" />
            <p className="text-sm text-foreground">
              Premium Expires on <span className="font-semibold text-yellow-500">{new Date(overview.premiumExpiry).toLocaleDateString()}</span>
            </p>
          </div>
        </GlowCard>
      )}

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6 animate-fade-up lg:items-stretch">
        {/* Active Giveaways - Takes 2 columns */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Active Giveaways</h2>
            <Link href={`/dashboard/${guildId}/giveaways`} className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          
          {activeGiveaways.length === 0 ? (
            <GlowCard className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-1">No Active Giveaways</h3>
              <p className="text-sm text-muted-foreground mb-4">Create Your First Giveaway to Get Started</p>
              <Link href={`/dashboard/${guildId}/create`}>
                <Button variant="outline" size="sm" className="border-primary/50 hover:bg-primary/10">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Giveaway
                </Button>
              </Link>
            </GlowCard>
          ) : (
            <GlowCard className="flex-1 p-0 overflow-hidden">
              <div className="divide-y divide-border/60">
                {activeGiveaways.slice(0, 5).map((giveaway) => (
                  <Link
                    key={giveaway.id}
                    href={`/dashboard/${guildId}/giveaways`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-primary/5 transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary shrink-0">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                        </span>
                        Active
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">{giveaway.prize}</p>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                          <span>{giveaway.winnerCount} winner{giveaway.winnerCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary shrink-0">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatEndsIn(giveaway.endsAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </GlowCard>
          )}
        </div>

        {/* Quick Actions - 1 column */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href={`/dashboard/${guildId}/create`} className="block">
              <GlowCard interactive className="p-4 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                    <PlusCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Create Giveaway</p>
                    <p className="text-xs text-muted-foreground">Start a New Giveaway</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </GlowCard>
            </Link>
            
            <Link href={`/dashboard/${guildId}/scheduled`} className="block">
              <GlowCard interactive className="p-4 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Scheduled</p>
                    <p className="text-xs text-muted-foreground">View Scheduled Giveaways</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </GlowCard>
            </Link>
            
            <Link href={`/dashboard/${guildId}/settings`} className="block">
              <GlowCard interactive className="p-4 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Settings</p>
                    <p className="text-xs text-muted-foreground">Configure Your Bot</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </GlowCard>
            </Link>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      {!isPremium && (
        <GlowCard className="bg-gradient-to-r from-primary/10 via-primary/5 to-yellow-500/10 border-primary/30 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
                <Crown className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Upgrade to Premium</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Unlock Unlimited Duration, Multiple Winners, Scheduled Giveaways, and Bonus Entries.
                </p>
              </div>
            </div>
            <Link href={`/dashboard/${guildId}/premium`}>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium">
                Upgrade Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </GlowCard>
      )}
    </div>
  )
}
