"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { GlowCard } from "@/components/glow-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { getGiveaway, updateGiveaway, type Giveaway } from "@/lib/api-client"

export default function EditGiveawayPage() {
  const params = useParams()
  const router = useRouter()
  const guildId = params.guildId as string
  const giveawayId = params.giveawayId as string
  
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGiveaway() {
      const result = await getGiveaway(guildId, giveawayId)
      if (result.success && result.data) {
        setGiveaway(result.data)
      } else {
        setError(result.error || "Failed to load giveaway")
      }
      setLoading(false)    }
    fetchGiveaway()
  }, [guildId, giveawayId])

  async function handleSave() {
    if (!giveaway) return
    
    setSaving(true)
    setError(null)

    const result = await updateGiveaway(guildId, giveawayId, {
      prize: giveaway.prize,
      description: giveaway.description,
      winners: giveaway.winners,
    })
    
    if (result.success) {
      router.push(`/dashboard/${guildId}/giveaways`)
    } else {
      setError(result.error || "Failed to update giveaway")
    }
    
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-foreground">Loading Giveaway...</div>
      </div>
    )
  }

  if (error && !giveaway) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/${guildId}/giveaways`}>
          <Button size="sm" variant="ghost" className="text-foreground/60 hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Edit Giveaway</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
          {error}
        </div>
      )}

      <GlowCard className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Prize
            </label>
            <Input
              value={giveaway?.prize || ""}
              onChange={(e) => setGiveaway(g => g ? { ...g, prize: e.target.value } : null)}
              placeholder="What Are You Giving Away?"
              className="bg-black/40 border-primary/30 text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <Input
              value={giveaway?.description || ""}
              onChange={(e) => setGiveaway(g => g ? { ...g, description: e.target.value } : null)}
              placeholder="Optional Description"
              className="bg-black/40 border-primary/30 text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Number of Winners
            </label>
            <Input
              type="number"
              min={1}
              value={giveaway?.winners || 1}
              onChange={(e) => setGiveaway(g => g ? { ...g, winners: parseInt(e.target.value) || 1 } : null)}
              className="bg-black/40 border-primary/30 text-foreground"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link href={`/dashboard/${guildId}/giveaways`}>
              <Button variant="ghost" className="text-foreground/60">
                Cancel
              </Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(34,197,94,0.5)]"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </GlowCard>
    </div>
  )
}
