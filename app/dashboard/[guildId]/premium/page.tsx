"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlowCard } from "@/components/glow-card"
import { Crown, Check, Calendar, Gift, AlertTriangle, ExternalLink, Sparkles } from "lucide-react"
import { redeemPremiumCode } from "@/lib/api-client"
import { useDashboard } from "@/contexts/dashboard-context"
import { RefreshButton } from "@/components/refresh-button"

export default function PremiumPage() {
  const { guildId, premium, isPremium, premiumMissing, refreshPremium } = useDashboard()
  const [error, setError] = useState<string | null>(null)
  const [redeemCode, setRedeemCode] = useState("")
  const [redeeming, setRedeeming] = useState(false)
  const [redeemSuccess, setRedeemSuccess] = useState(false)

  async function handleRedeem() {
    if (!redeemCode.trim()) return
    
    setRedeeming(true)
    setError(null)
    setRedeemSuccess(false)

    const result = await redeemPremiumCode(guildId, redeemCode.trim())
    
    if (result.success) {
      setRedeemSuccess(true)
      setRedeemCode("")
      refreshPremium()
    } else {
      setError(result.error || "Failed to Redeem Code")
    }
    
    setRedeeming(false)
  }

  const features = [
    "Unlimited Giveaway Duration",
    "Up to 100 Winners per Giveaway",
    "Unlimited Active Giveaways",
    "Scheduled Giveaways",
    "Bonus Entries for Roles",
    "Winner Role Assignment",
    "Custom Embed Colors",
    "Priority Support",
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/15">
            <Crown className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Premium</h1>
            <p className="text-muted-foreground">Unlock premium features for your server</p>
          </div>
        </div>
        <RefreshButton onRefresh={refreshPremium} />
      </div>

      {/* Notices */}
      {premiumMissing && (
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

      {redeemSuccess && (
        <GlowCard className="p-4">
          <p className="text-sm text-primary">Premium Code Redeemed Successfully!</p>
        </GlowCard>
      )}

      {/* Current Status */}
      <GlowCard className={`relative overflow-hidden p-6 ${isPremium ? "border-yellow-500/40 bg-gradient-to-br from-yellow-500/15 via-card to-card" : ""}`}>
        {isPremium && <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-500/20 blur-3xl" />}
        <div className="relative flex items-start gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${isPremium ? "bg-yellow-500/20" : "bg-secondary"}`}>
            <Crown className={`h-7 w-7 ${isPremium ? "text-yellow-500" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">
              {premiumMissing ? "Unknown Status" : isPremium ? "Premium Active" : "Free Plan"}
            </h2>
            {isPremium ? (
              <>
                <p className="text-muted-foreground mt-1">
                  Plan: <span className="text-yellow-500 font-semibold capitalize">{premium?.plan}</span>
                </p>
                {premium?.expiresAt && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4" />
                    Expires: {new Date(premium.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground mt-1">
                Upgrade to Unlock All Premium Features Below
              </p>
            )}
          </div>
        </div>
      </GlowCard>

      {/* Features */}
      <GlowCard className="p-0 overflow-hidden">
        <div className="border-b border-border/60 bg-secondary/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Premium Features</h2>
              <p className="text-sm text-muted-foreground">Everything included with Premium</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border/60 bg-secondary/20 p-3">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full ${isPremium ? "bg-primary/20" : "bg-secondary"}`}>
                <Check className={`h-3.5 w-3.5 ${isPremium ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </GlowCard>

      {/* Redeem Code */}
      <GlowCard className="p-0 overflow-hidden">
        <div className="border-b border-border/60 bg-secondary/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
              <Gift className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Redeem Code</h2>
              <p className="text-sm text-muted-foreground">Have a premium code? Redeem it here</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="flex gap-3">
            <Input
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX-XXXX"
              className="font-mono bg-background/50 border-border/70 focus:border-primary"
            />
            <Button
              onClick={handleRedeem}
              disabled={redeeming || !redeemCode.trim()}
              className="bg-primary hover:bg-primary/90 min-w-24"
            >
              {redeeming ? "..." : "Redeem"}
            </Button>
          </div>
        </div>
      </GlowCard>

      {/* Purchase / Vote */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {!isPremium && (
          <GlowCard className="border-yellow-500/40 bg-gradient-to-br from-yellow-500/15 via-card to-card p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20">
              <Crown className="h-5 w-5 text-yellow-500" />
            </div>
            <h3 className="mb-2 font-semibold text-foreground">Get Premium</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Purchase Premium to unlock all features instantly
            </p>
            <Link href="/#premium">
              <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                View Plans
              </Button>
            </Link>
          </GlowCard>
        )}

        <GlowCard className="p-5">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <ExternalLink className="h-5 w-5 text-primary" />
          </div>
          <h3 className="mb-2 font-semibold text-foreground">Free Premium</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Vote for us to get 24 hours of free Premium
          </p>
          <div className="flex gap-3">
            <a href="https://top.gg" target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" className="w-full border-border/70 hover:border-primary/50 hover:bg-primary/5">
                Top.gg
                <ExternalLink className="h-3.5 w-3.5 ml-2" />
              </Button>
            </a>
            <a href="https://botlist.me" target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" className="w-full border-border/70 hover:border-primary/50 hover:bg-primary/5">
                Botlist
                <ExternalLink className="h-3.5 w-3.5 ml-2" />
              </Button>
            </a>
          </div>
        </GlowCard>
      </div>
    </div>
  )
}
