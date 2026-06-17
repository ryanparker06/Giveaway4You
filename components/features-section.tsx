import { Check, X } from "lucide-react"
import { GlowCard } from "@/components/glow-card"

const allFeatures = [
  { name: "Start Giveaway Command", free: true, premium: true },
  { name: "End Giveaway Early", free: true, premium: true },
  { name: "Cancel Giveaway", free: true, premium: true },
  { name: "Reroll Winner", free: true, premium: true },
  { name: "Giveaway Duration", free: "Up to 24 Hours", premium: "Unlimited" },
  { name: "Winners Per Giveaway", free: "One", premium: "Unlimited" },
  { name: "Active Giveaways Per Server", free: "One", premium: "Unlimited" },
  { name: "Automatically Add Role to Winner", free: false, premium: true },
  { name: "Giveaway Access Permissions", free: false, premium: true },
  { name: "Giveaway Scheduler", free: false, premium: true },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Powerful <span className="text-primary">Features</span>
          </h2>
          <p className="text-foreground max-w-2xl mx-auto">
            Compare what you get with our Free and Premium plans.
          </p>
        </div>

        <GlowCard className="p-0 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 bg-black/40">
            <div className="pt-4 pb-2 px-3 sm:pt-6 sm:pb-3 sm:px-6 text-left" />
            <div className="pt-4 pb-2 px-3 sm:pt-6 sm:pb-3 sm:px-6 text-center border-l border-border/20">
              <span className="text-[10px] sm:text-xs font-bold text-foreground tracking-wider">Free</span>
            </div>
            <div className="pt-4 pb-2 px-3 sm:pt-6 sm:pb-3 sm:px-6 text-center border-l border-border/20 bg-primary/5">
              <span className="text-[10px] sm:text-xs font-bold text-primary tracking-wider">Premium</span>
            </div>
          </div>

          {/* Rows */}
          {allFeatures.map((feature, index) => (
            <div 
              key={feature.name} 
              className={`grid grid-cols-3 transition-colors hover:bg-white/5 ${
                index !== allFeatures.length - 1 ? "border-b border-border/10" : ""
              }`}
            >
              <div className={`py-2 px-3 sm:py-3 sm:px-6 flex items-center ${index === allFeatures.length - 1 ? "pb-4 sm:pb-6" : ""}`}>
                <span className="text-[10px] sm:text-xs text-foreground">{feature.name}</span>
              </div>
              <div className={`py-2 px-3 sm:py-3 sm:px-6 flex items-center justify-center border-l border-border/10 ${index === allFeatures.length - 1 ? "pb-4 sm:pb-6" : ""}`}>
                {typeof feature.free === "boolean" ? (
                  feature.free ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5">
                      <X className="h-3 w-3 text-foreground" />
                    </div>
                  )
                ) : (
                  <span className="text-xs text-foreground font-medium">{feature.free}</span>
                )}
              </div>
              <div className={`py-2 px-3 sm:py-3 sm:px-6 flex items-center justify-center border-l border-border/10 bg-primary/5 ${index === allFeatures.length - 1 ? "pb-4 sm:pb-6" : ""}`}>
                {typeof feature.premium === "boolean" ? (
                  feature.premium ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/30">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5">
                      <X className="h-3 w-3 text-foreground" />
                    </div>
                  )
                ) : (
                  <span className="text-xs text-primary font-semibold">{feature.premium}</span>
                )}
              </div>
            </div>
          ))}
        </GlowCard>
      </div>
    </section>
  )
}
