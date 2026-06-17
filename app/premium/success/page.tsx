"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/glow-card"
import { Check, Copy } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [code, setCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    const fetchCode = async () => {
      try {
        const res = await fetch(`/api/get-premium-code?session_id=${sessionId}`)
        const data = await res.json()
        if (data.code) {
          setCode(data.code)
        }
      } catch (err) {
        console.error("Failed to fetch premium code:", err)
      } finally {
        setLoading(false)
      }
    }

    // Small delay to allow webhook to process
    const timer = setTimeout(fetchCode, 2000)
    return () => clearTimeout(timer)
  }, [sessionId])

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="py-32">
        <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 text-center">
          <GlowCard className="border-primary shadow-[0_0_50px_rgba(34,197,94,0.3)]">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Payment Successful
            </h1>
            <p className="text-foreground mb-6">
              Thank you for purchasing Premium! Use the code below with /premium-redeem in your Discord server to activate your benefits.
            </p>

            {loading ? (
              <div className="mb-6 py-4 px-6 rounded-lg bg-black/40 border border-primary/30">
                <p className="text-sm text-foreground/60">Loading your premium code...</p>
              </div>
            ) : code ? (
              <div className="mb-6 py-4 px-6 rounded-lg bg-black/40 border border-primary/30 text-center">
                <p className="text-xs text-foreground/60 mb-2">Your Premium Code</p>
                <span className="font-mono text-xl sm:text-2xl text-primary font-bold tracking-wider">{code}</span>
                <div className="mt-2">
                  <button
                    onClick={copyCode}
                    className="p-2 rounded-md hover:bg-white/10 transition-colors inline-flex items-center gap-1 text-xs text-foreground/60"
                    title="Copy code"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6 py-4 px-6 rounded-lg bg-black/40 border border-primary/30">
                <p className="text-sm text-foreground/60">Your code is being generated. Please refresh in a moment.</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                  Back to Home
                </Button>
              </Link>
              <a href="https://discord.gg/EuWYYbHwmv" target="_blank" rel="noopener noreferrer">
                <Button className="w-full sm:w-auto bg-black/60 backdrop-blur-sm border border-primary/30 text-primary hover:bg-black/70 hover:border-primary/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                  Support Server
                </Button>
              </a>
            </div>
          </GlowCard>
        </div>
      </section>
      <Footer />
    </main>
  )
}

export default function PremiumSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SuccessContent />
    </Suspense>
  )
}
