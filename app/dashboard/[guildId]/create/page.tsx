"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlowCard } from "@/components/glow-card"
import { Gift, Star, Lock, ArrowLeft, Clock, Users, Hash, Loader2, Plus, Trash2 } from "lucide-react"
import { createGiveaway, type CreateGiveawayInput } from "@/lib/api-client"
import { useDashboard } from "@/contexts/dashboard-context"

interface Channel {
  id: string
  name: string
}

interface Role {
  id: string
  name: string
}

export default function CreateGiveawayPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { guildId, isPremium, refreshGiveaways, refreshScheduled } = useDashboard()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Channels state
  const [channels, setChannels] = useState<Channel[]>([])
  const [loadingChannels, setLoadingChannels] = useState(true)
  const [channelsError, setChannelsError] = useState<string | null>(null)

  // Roles state
  const [roles, setRoles] = useState<Role[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [rolesError, setRolesError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    prize: "",
    channelId: "",
    winners: 1,
    duration: 24,
    durationUnit: "hours" as "minutes" | "hours" | "days",
    scheduled: false,
    scheduledStart: "",
    requiredRoles: [] as string[],
    bonusEntries: [] as { roleId: string; entries: number }[],
  })

  // When the server is not premium (or premium was removed), reset all
  // premium-only fields back to their free defaults: 1 winner, a fixed
  // 24 hour duration, no scheduling, no required roles, no bonus entries.
  useEffect(() => {
    if (!isPremium) {
      setFormData((prev) => ({
        ...prev,
        winners: 1,
        duration: 24,
        durationUnit: "hours",
        scheduled: false,
        scheduledStart: "",
        requiredRoles: [],
        bonusEntries: [],
      }))
    }
  }, [isPremium])

  // Fetch channels on mount
  useEffect(() => {
    async function fetchChannels() {
      try {
        const response = await fetch(
          `https://giveaway4you-api.onrender.com/api/guilds/${guildId}/channels`
        )
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to load channels")
        }
        
        // Backend returns: { success: true, count: N, channels: [...] }
        setChannels(data.channels || [])
        setChannelsError(null)
      } catch (err) {
        setChannelsError("Failed to Load Channels")
      } finally {
        setLoadingChannels(false)
      }
    }
    
    fetchChannels()
  }, [guildId])

  // Fetch roles on mount
  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await fetch(
          `https://giveaway4you-api.onrender.com/api/guilds/${guildId}/roles`
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to load roles")
        }

        // Backend returns: { success: true, count: N, roles: [...] }
        setRoles(data.roles || [])
        setRolesError(null)
      } catch (err) {
        setRolesError("Failed to Load Roles")
      } finally {
        setLoadingRoles(false)
      }
    }

    fetchRoles()
  }, [guildId])

  function getDurationInMilliseconds() {
    const multipliers = { minutes: 60 * 1000, hours: 60 * 60 * 1000, days: 24 * 60 * 60 * 1000 }
    return formData.duration * multipliers[formData.durationUnit]
  }

  function addBonusEntry() {
    setFormData({
      ...formData,
      bonusEntries: [...formData.bonusEntries, { roleId: "", entries: 1 }],
    })
  }

  function updateBonusEntry(index: number, field: "roleId" | "entries", value: string) {
    setFormData({
      ...formData,
      bonusEntries: formData.bonusEntries.map((entry, i) =>
        i === index
          ? {
              ...entry,
              [field]: field === "entries" ? Math.max(parseInt(value) || 1, 1) : value,
            }
          : entry
      ),
    })
  }

  function removeBonusEntry(index: number) {
    setFormData({
      ...formData,
      bonusEntries: formData.bonusEntries.filter((_, i) => i !== index),
    })
  }

  async function handleSubmit() {
    if (!formData.prize.trim()) {
      setError("Prize Is Required")
      return
    }
    if (!formData.channelId) {
      setError("Please Select a Channel")
      return
    }

    setSubmitting(true)
    setError(null)

    const input: CreateGiveawayInput = {
      prize: formData.prize,
      channelId: formData.channelId,
      duration: getDurationInMilliseconds(),
      winnerCount: formData.winners,
      hostedBy: "Dashboard",
      bonusEntries: isPremium
        ? formData.bonusEntries.filter((e) => e.roleId.trim())
        : undefined,
      requiredRoles: isPremium && formData.requiredRoles.length > 0 ? formData.requiredRoles : undefined,
      blacklistedRoles: undefined,
      dmWinner: true,
      remindNotifications: true,
      scheduledStart:
        isPremium && formData.scheduled && formData.scheduledStart
          ? new Date(formData.scheduledStart).toISOString()
          : undefined,
    }

    const result = await createGiveaway(guildId, input, session?.user?.id)
    
    if (result.success) {
      // Redirect immediately, refresh data in background
      if (formData.scheduled && isPremium) {
        router.push(`/dashboard/${guildId}/scheduled`)
        refreshScheduled()
      } else {
        router.push(`/dashboard/${guildId}/giveaways`)
        refreshGiveaways()
      }
      return
    } else {
      // Show specific error messages based on status code
      if (result.statusCode === 502) {
        setError("The Giveaway4You API Is Waking Up. Please Try Again in a Moment.")
      } else if (result.statusCode === 500) {
        setError(result.error || "Server Error. Please Try Again Later.")
      } else {
        setError(result.error || "Failed to Create Giveaway")
      }
    }
    
    setSubmitting(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-border/60 pb-6">
        <Link 
          href={`/dashboard/${guildId}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
            <Gift className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Giveaway</h1>
            <p className="text-muted-foreground">Start a new giveaway for your server</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <GlowCard className="bg-destructive/10 border-destructive/30 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </GlowCard>
      )}

      {/* Basic Info */}
      <GlowCard className="p-0 overflow-hidden">
        <div className="border-b border-border/60 bg-secondary/30 px-5 py-4">
          <h2 className="font-semibold text-foreground">Basic Information</h2>
          <p className="text-sm text-muted-foreground">Required details for your giveaway</p>
        </div>
        
        <div className="p-5 space-y-5">
          {/* Prize */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Prize <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.prize}
              onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
              placeholder="e.g., Discord Nitro, $50 Gift Card"              className="bg-background/50 border-primary/30 focus:border-primary"
            />
          </div>

          {/* Channel Select */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <span className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                Channel <span className="text-destructive">*</span>
              </span>
            </label>
            {loadingChannels ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-background/50 border border-primary/30 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading Channels...</span>
              </div>
            ) : channelsError ? (
              <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {channelsError}
              </div>
            ) : (
              <select
                value={formData.channelId}
                onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              >
                <option value="">Select a Channel</option>
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    #{channel.name}
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-muted-foreground mt-2">Select the Channel Where the Giveaway Will Be Posted</p>
          </div>

          {/* Winners & Duration */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className={!isPremium ? "opacity-50" : ""}>
              <label className="block text-sm font-medium text-foreground mb-2">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Number of Winners
                  {!isPremium && <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">Premium</span>}
                </span>
              </label>
              <Input
                type="number"
                min={1}
                max={100}
                value={formData.winners}
                onChange={(e) => setFormData({ ...formData, winners: Math.min(parseInt(e.target.value) || 1, 100) })}
                disabled={!isPremium}
                className="bg-background/50 border-primary/30 focus:border-primary"
              />
              {!isPremium && (
                <p className="text-xs text-yellow-500 mt-2">Upgrade to Premium to Customize Number of Winners</p>
              )}
            </div>
            <div className={!isPremium ? "opacity-50" : ""}>
              <label className="block text-sm font-medium text-foreground mb-2">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Duration
                  {!isPremium && <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">Premium</span>}
                </span>
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                  disabled={!isPremium}
                  className="w-24 bg-background/50 border-primary/30 focus:border-primary"
                />
                <select
                  value={formData.durationUnit}
                  onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value as "minutes" | "hours" | "days" })}
                  disabled={!isPremium}
                  className={`flex-1 px-4 py-2 rounded-xl bg-background/50 border border-primary/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${!isPremium ? "cursor-not-allowed" : ""}`}
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
              {!isPremium && (
                <p className="text-xs text-yellow-500 mt-2">Upgrade to Premium to Customize Giveaway Duration</p>
              )}
            </div>
          </div>
        </div>
      </GlowCard>

      {/* Premium Features */}
      <GlowCard className="p-0 overflow-hidden border-yellow-500/30">
        <div className="px-5 py-4 border-b border-yellow-500/20 bg-yellow-500/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Premium Features</h2>
              <p className="text-sm text-muted-foreground">Unlock Advanced Giveaway Options</p>
            </div>
          </div>
          {!isPremium && (
            <Link href={`/dashboard/${guildId}/premium`}>
              <Button variant="outline" size="sm" className="text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10">
                <Lock className="h-3.5 w-3.5 mr-2" />
                Upgrade
              </Button>
            </Link>
          )}
        </div>
        
        <div className="p-5 space-y-5">
          {/* Schedule */}
          <div className={!isPremium ? "opacity-50" : ""}>
            <label className="block text-sm font-medium text-foreground mb-1">Schedule for Later</label>
            <p className="text-xs text-muted-foreground mb-3">
              Set a specific start time for your giveaway. Leave empty to start immediately.
            </p>
            <Input
              type="datetime-local"
              value={formData.scheduledStart}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  scheduledStart: e.target.value,
                  scheduled: e.target.value.length > 0,
                })
              }
              disabled={!isPremium}
              className="bg-background/50 border-primary/30 focus:border-primary max-w-xs"
            />
          </div>

          {/* Bonus Entries */}
          <div className={!isPremium ? "opacity-50" : ""}>
            <label className="block text-sm font-medium text-foreground mb-2">
              Bonus Entries
            </label>
            <p className="text-xs text-muted-foreground mb-3">Give Extra Entries to Specific Roles</p>

            {formData.bonusEntries.length > 0 && (
              <div className="space-y-3 mb-3">
                {formData.bonusEntries.map((entry, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs text-muted-foreground mb-1">Role</label>
                      {loadingRoles ? (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background/50 border border-primary/30 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Loading Roles...</span>
                        </div>
                      ) : rolesError ? (
                        <div className="px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                          {rolesError}
                        </div>
                      ) : (
                        <select
                          value={entry.roleId}
                          onChange={(e) => updateBonusEntry(index, "roleId", e.target.value)}
                          disabled={!isPremium}
                          className="w-full px-4 py-2 rounded-xl bg-background/50 border border-primary/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors disabled:cursor-not-allowed"
                        >
                          <option value="">Select a Role</option>
                          {roles
                            .filter(
                              (role) =>
                                role.id === entry.roleId ||
                                !formData.bonusEntries.some((b) => b.roleId === role.id)
                            )
                            .map((role) => (
                              <option key={role.id} value={role.id}>
                                @{role.name}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                    <div className="w-28">
                      <label className="block text-xs text-muted-foreground mb-1">Entries</label>
                      <Input
                        type="number"
                        min={1}
                        value={entry.entries}
                        onChange={(e) => updateBonusEntry(index, "entries", e.target.value)}
                        disabled={!isPremium}
                        className="bg-background/50 border-primary/30 focus:border-primary"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeBonusEntry(index)}
                      disabled={!isPremium}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 shrink-0"
                      aria-label="Remove bonus entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBonusEntry}
              disabled={!isPremium}
              className="border-primary/30 hover:bg-primary/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Bonus Role
            </Button>
          </div>
        </div>
      </GlowCard>

      {/* Actions */}
      <div className="flex items-center justify-end pt-2">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-primary hover:bg-primary/90 min-w-32"
        >
          {submitting ? "Creating..." : "Create Giveaway"}
        </Button>
      </div>
    </div>
  )
}
