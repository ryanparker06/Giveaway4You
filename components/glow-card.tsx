import { cn } from "@/lib/utils"

interface GlowCardProps {
  children: React.ReactNode
  className?: string
  /**
   * "subtle" (default) — neutral bordered surface that lifts on hover.
   * "glow" — featured card with a persistent green glow.
   */
  variant?: "subtle" | "glow"
  interactive?: boolean
}

export function GlowCard({ children, className, variant = "subtle", interactive = false }: GlowCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-card p-6 transition-all duration-300 ease-out",
        variant === "subtle" && [
          "border-border",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_16px_-4px_rgba(0,0,0,0.5)]",
          interactive &&
            "hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),0_0_0_1px_rgba(34,197,94,0.15),0_12px_32px_-8px_rgba(0,0,0,0.6),0_0_28px_-6px_rgba(34,197,94,0.22)]",
        ],
        variant === "glow" && [
          "border-primary/45",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),0_0_0_1px_rgba(34,197,94,0.12),0_8px_28px_-8px_rgba(0,0,0,0.6),0_0_36px_-8px_rgba(34,197,94,0.28)]",
          interactive &&
            "hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.09),0_0_0_1px_rgba(34,197,94,0.2),0_14px_36px_-8px_rgba(0,0,0,0.65),0_0_48px_-6px_rgba(34,197,94,0.4)]",
        ],
        className
      )}
    >
      {children}
    </div>
  )
}
