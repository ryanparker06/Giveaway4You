"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { GlowCard } from "@/components/glow-card"
import { Save, Bell, Users, AlertTriangle, Star, ArrowRight, Settings } from "lucide-react"
import { updateGuildSettings, type GuildSettings } from "@/lib/api-client"
import { useDashboard } from "@/contexts/dashboard-context"
import { RefreshButton } from "@/components/refresh-button"

export default function SettingsPage() {
  const { guildId, settings, isPremium, settingsMissing, refreshSettings, updateSettings } = useDashboard()
  const [localSettings, setLocalSettings] = useState<GuildSettings | null>(settings)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Toggle state for role features. Initialise as "on" when a value already exists.
  const [winnerRoleEnabled, setWinnerRoleEnabled] = useState<boolean>(!!settings?.winnerRole)
  const [requiredRolesEnabled, setRequiredRolesEnabled] = useState<boolean>(
    !!settings?.requiredRoles?.length,
  )
  const [blacklistedRolesEnabled, setBlacklistedRolesEnabled] = useState<boolean>(
    !!settings?.blacklistedRoles?.length,
  )

  // Sync local settings when context settings change
  if (settings && !localSettings) {
    setLocalSettings(settings)
  }

  async function handleSave() {
    if (!localSettings) return
    
    setSaving(true)
    setError(null)
    setSuccess(false)

    const result = await updateGuildSettings(guildId, localSettings)
    
    if (result.success) {
      setSuccess(true)
      updateSettings(localSettings)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || "Failed to Save Settings")
    }
    
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
            <p className="text-muted-foreground">Configure your server preferences</p>
          </div>
        </div>
        <RefreshButton onRefresh={refreshSettings} />
      </div>

      {/* Notices */}
      {settingsMissing && (
        <GlowCard className="bg-yellow-500/5 border-yellow-500/30 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
            <p className="text-sm text-yellow-500">Some API Endpoints Are Not Implemented Yet.</p>
          </div>
        </GlowCard>
      )}

      {error && (
        <GlowCard className="bg-destructive/10 border-destructive/30 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </GlowCard>
      )}

      {success && (
        <GlowCard className="p-4">
          <p className="text-sm text-primary">Settings Saved Successfully!</p>
        </GlowCard>
      )}

      {/* Role Settings */}
      <GlowCard className="p-0 overflow-hidden">
        <div className="border-b border-border/60 bg-secondary/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Roles</h2>
              <p className="text-sm text-muted-foreground">Role requirements and permissions</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-border/60">
          {/* Winner Role */}
          <div className={`px-5 py-4 ${!isPremium ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Winner Role</span>
                  {!isPremium && (
                    <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">Premium</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Assign a role automatically to winners</p>
              </div>
              <Switch
                checked={winnerRoleEnabled}
                onCheckedChange={(checked) => {
                  setWinnerRoleEnabled(checked)
                  if (!checked) setLocalSettings((s) => (s ? { ...s, winnerRole: null } : null))
                }}
                disabled={!isPremium}
              />
            </div>
            {winnerRoleEnabled && (
              <Input
                value={localSettings?.winnerRole || ""}
                onChange={(e) => setLocalSettings((s) => (s ? { ...s, winnerRole: e.target.value || null } : null))}
                placeholder="Role ID to Assign to Winners"
                disabled={!isPremium}
                className="mt-3 bg-background/50 border-primary/30 focus:border-primary"
              />
            )}
          </div>

          {/* Required Roles */}
          <div className={`px-5 py-4 ${!isPremium ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Required Roles</span>
                  {!isPremium && (
                    <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">Premium</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Only members with these roles can enter</p>
              </div>
              <Switch
                checked={requiredRolesEnabled}
                onCheckedChange={(checked) => {
                  setRequiredRolesEnabled(checked)
                  if (!checked) setLocalSettings((s) => (s ? { ...s, requiredRoles: [] } : null))
                }}
                disabled={!isPremium}
              />
            </div>
            {requiredRolesEnabled && (
              <Input
                value={localSettings?.requiredRoles?.join(", ") || ""}
                onChange={(e) =>
                  setLocalSettings((s) =>
                    s
                      ? {
                          ...s,
                          requiredRoles: e.target.value.split(",").map((r) => r.trim()).filter(Boolean),
                        }
                      : null,
                  )
                }
                placeholder="Role IDs, separated by commas"
                disabled={!isPremium}
                className="mt-3 bg-background/50 border-primary/30 focus:border-primary"
              />
            )}
          </div>

          {/* Blacklisted Roles */}
          <div className={`px-5 py-4 ${!isPremium ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Blacklisted Roles</span>
                  {!isPremium && (
                    <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">Premium</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Members with these roles cannot enter</p>
              </div>
              <Switch
                checked={blacklistedRolesEnabled}
                onCheckedChange={(checked) => {
                  setBlacklistedRolesEnabled(checked)
                  if (!checked) setLocalSettings((s) => (s ? { ...s, blacklistedRoles: [] } : null))
                }}
                disabled={!isPremium}
              />
            </div>
            {blacklistedRolesEnabled && (
              <Input
                value={localSettings?.blacklistedRoles?.join(", ") || ""}
                onChange={(e) =>
                  setLocalSettings((s) =>
                    s
                      ? {
                          ...s,
                          blacklistedRoles: e.target.value.split(",").map((r) => r.trim()).filter(Boolean),
                        }
                      : null,
                  )
                }
                placeholder="Role IDs, separated by commas"
                disabled={!isPremium}
                className="mt-3 bg-background/50 border-primary/30 focus:border-primary"
              />
            )}
          </div>
        </div>
      </GlowCard>

      {/* Notifications */}
      <GlowCard className="p-0 overflow-hidden">
        <div className="border-b border-border/60 bg-secondary/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Notifications</h2>
              <p className="text-sm text-muted-foreground">Notification preferences</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-border/60">
          <div className={`flex items-center justify-between gap-4 px-5 py-4 ${!isPremium ? "opacity-50" : ""}`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">DM Winners</span>
                {!isPremium && (
                  <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">Premium</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Send a Direct Message When Someone Wins</p>
            </div>
            <Switch
              checked={localSettings?.dmWinners ?? true}
              onCheckedChange={(checked) => setLocalSettings((s) => (s ? { ...s, dmWinners: checked } : null))}
              disabled={!isPremium}
            />
          </div>

          <div className={`flex items-center justify-between gap-4 px-5 py-4 ${!isPremium ? "opacity-50" : ""}`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Reminder Notifications</span>
                {!isPremium && (
                  <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">Premium</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Send Reminders Before Giveaway Ends</p>
            </div>
            <Switch
              checked={localSettings?.reminderNotifications ?? false}
              onCheckedChange={(checked) =>
                setLocalSettings((s) => (s ? { ...s, reminderNotifications: checked } : null))
              }
              disabled={!isPremium}
            />
          </div>
        </div>
      </GlowCard>

      {/* Premium Upsell */}
      {!isPremium && (
        <GlowCard className="bg-gradient-to-r from-yellow-500/10 to-primary/10 border-yellow-500/30 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Unlock All Settings</p>
                <p className="text-sm text-muted-foreground">Get Access to All Premium Features</p>
              </div>
            </div>
            <Link href={`/dashboard/${guildId}/premium`}>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                Upgrade
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </GlowCard>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 min-w-32">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
