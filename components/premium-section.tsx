import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/glow-card"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "£0",
    period: "Forever",
    description: "Great for Getting Started!",
    features: [
      "Start Giveaway Command",
      "End Giveaway Early",
      "Cancel Giveaway",
      "Reroll Winner",
      "Giveaways Up to 24 Hours",
      "One Winner Per Giveaway",
      "One Active Giveaway Per Server",
    ],
    highlighted: false,
    checkoutUrl: null,
  },
  {
    name: "Premium",
    price: "£4.99",
    period: "/Month",
    description: "Better for Larger Servers!",
    features: [
      "Start Giveaway Command",
      "End Giveaway Early",
      "Cancel Giveaway",
      "Reroll Winner",
      "Unlimited Giveaway Duration",
      "Unlimited Winners Per Giveaway",
      "Unlimited Giveaways Per Server",
      "Automatically Add Role to Winner",
      "Giveaway Access Permissions",
      "Giveaway Scheduler",
    ],
    highlighted: true,
    checkoutUrl: "/api/create-checkout-session?plan=monthly",
  },
  {
    name: "Lifetime",
    price: "£49.99",
    period: "One-Time",
    description: "Pay once, enjoy forever",
    features: [
      "Start Giveaway Command",
      "End Giveaway Early",
      "Cancel Giveaway",
      "Reroll Winner",
      "Unlimited Giveaway Duration",
      "Unlimited Winners Per Giveaway",
      "Unlimited Giveaways Per Server",
      "Automatically Add Role to Winner",
      "Giveaway Access Permissions",
      "Giveaway Scheduler",
    ],
    highlighted: false,
    checkoutUrl: "/api/create-checkout-session?plan=lifetime",
  },
]

export function PremiumSection() {
  return (
    <section id="premium" className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Choose Your <span className="text-primary">Plan</span>
          </h2>
          <p className="text-foreground max-w-2xl mx-auto">
            Start free and upgrade as your community grows. All plans include our core features.
          </p>
          <p className="text-sm text-primary mt-4">
            Want to earn free premium? Vote for us on Top.gg or Botlist.me and get 24hrs free premium!
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {plans.map((plan) => (
            <GlowCard
              key={plan.name}
              className={plan.highlighted ? "border-primary shadow-[0_0_50px_rgba(34,197,94,0.3)]" : ""}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-block rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center mb-4">
                <h3 className="text-base font-bold text-foreground mb-1">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl font-bold text-primary">{plan.price}</span>
                  <span className="text-xs text-foreground">{plan.period}</span>
                </div>
                <p className="text-xs text-foreground mt-1">{plan.description}</p>
              </div>
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs text-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.checkoutUrl ? (
                <Link href={plan.checkoutUrl}>
                  <Button
                    className={
                      plan.highlighted
                        ? "w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                        : "w-full bg-black/60 backdrop-blur-sm border border-primary/30 text-primary hover:bg-black/70 hover:border-primary/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                    }
                    variant={plan.highlighted ? "default" : "default"}
                  >
                    {plan.name === "Lifetime" ? "Buy Lifetime" : "Upgrade Now"}
                  </Button>
                </Link>
              ) : null}
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  )
}
