"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlowCard } from "@/components/glow-card"
import { Button } from "@/components/ui/button"
import { Search, Users, CheckCircle2, Loader2 } from "lucide-react"

const BOT_CLIENT_ID = "1503692598395797575"

interface Guild {
  id: string
  name: string
  icon: string | null
  memberCount?: number | null
  bot?: boolean
}

export default function DashboardPage() {
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGuilds() {
      try {
        // Fetch from Next.js API route which merges Discord OAuth guilds with backend install status
        const response = await fetch("/api/guilds", {
          credentials: "include",
          cache: "no-store",
        })
        
        if (!response.ok) {
          throw new Error("Failed to fetch guilds")
        }
        
        const data = await response.json()
        const guildList = Array.isArray(data) ? data : data.guilds || []
        
        setGuilds(guildList)
      } catch (err) {
        setError("Failed to Load Servers")
      } finally {
        setLoading(false)
      }
    }
    fetchGuilds()
  }, [])

  // Filter by search and sort: installed first, then alphabetically
  const filteredGuilds = guilds
    .filter((guild) => guild.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      // Installed servers first
      if (a.bot && !b.bot) return -1
      if (!a.bot && b.bot) return 1
      // Then alphabetically by name
      return a.name.localeCompare(b.name)
    })

  const getGuildIcon = (guild: Guild) => {
    if (guild.icon) {
      return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
    }
    return null
  }

  const getInviteUrl = (guildId: string) => {
    return `https://discord.com/oauth2/authorize?client_id=${BOT_CLIENT_ID}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="text-sm">Loading your servers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  const installedCount = guilds.filter((g) => g.bot).length

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      {/* Hero header */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card p-6 sm:p-8 animate-fade-up">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">Select a Server</h1>
            <p className="mt-2 text-foreground/60">Choose a server to manage your giveaways</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-border/60 bg-card/60 px-4 py-2 text-center">
              <p className="text-2xl font-bold text-primary">{installedCount}</p>
              <p className="text-xs text-muted-foreground">Installed</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/60 px-4 py-2 text-center">
              <p className="text-2xl font-bold text-foreground">{guilds.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
        <input
          type="text"
          placeholder="Search servers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border/70 bg-card/60 py-3 pl-11 pr-4 text-foreground transition-colors placeholder:text-foreground/40 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {filteredGuilds.length === 0 ? (
        <GlowCard className="p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-foreground/60">
            {search
              ? "No servers found matching your search"
              : "No servers found. The bot may not be in any servers yet."}
          </p>
        </GlowCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
          {filteredGuilds.map((guild) => {
            const iconUrl = getGuildIcon(guild)

            return (
              <GlowCard
                key={guild.id}
                interactive
                className="flex h-full flex-col p-5"
              >
                <div className="mb-5 flex flex-1 items-center gap-4">
                  {iconUrl ? (
                    <img
                      src={iconUrl || "/placeholder.svg"}
                      alt={guild.name}
                      className="h-14 w-14 flex-shrink-0 rounded-2xl ring-2 ring-border"
                    />
                  ) : (
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/15 ring-2 ring-primary/20">
                      <span className="text-xl font-bold text-primary">{guild.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-foreground">{guild.name}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      {guild.memberCount && (
                        <span className="flex items-center gap-1 text-xs text-foreground/60">
                          <Users className="h-3 w-3" />
                          {guild.memberCount.toLocaleString()}
                        </span>
                      )}
                      {guild.bot ? (
                        <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                          <CheckCircle2 className="h-3 w-3" />
                          Installed
                        </span>
                      ) : (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-foreground/50">
                          Not Installed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {guild.bot ? (
                  <Link href={`/dashboard/${guild.id}`}>
                    <Button className="w-full bg-primary text-primary-foreground shadow-[0_0_20px_-4px_rgba(34,197,94,0.4)] hover:bg-primary/90">
                      Configure
                    </Button>
                  </Link>
                ) : (
                  <a href={getInviteUrl(guild.id)} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      className="w-full border-border/70 bg-card/40 text-foreground hover:border-primary/50 hover:bg-primary/5"
                    >
                      Invite Giveaway4You
                    </Button>
                  </a>
                )}
              </GlowCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
