import { GlowCard } from "@/components/glow-card"
import { ChevronRight } from "lucide-react"

const steps = [
  {
    step: "01",
    title: "Invite Giveaway4You",
    description: "Click 'Add Giveaway4You' and authorize the necessary permissions.",
    command: null,
    type: "invite" as const,
  },
  {
    step: "02",
    title: "Check the Commands",
    description: "Use /help to view all available commands and their options.",
    command: "/help",
    type: "command" as const,
  },
  {
    step: "03",
    title: "Start Your Giveaway",
    description: "Use /giveaway-start to create your first giveaway with customizable options.",
    command: "/giveaway-start",
    type: "command" as const,
  },
  {
    step: "04",
    title: "Watch Engagement Grow",
    description: "Sit back and watch as your community participates in exciting giveaways!",
    command: null,
    type: "celebrate" as const,
  },
]

export function SetupSection() {
  return (
    <section id="setup" className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Setup <span className="text-primary">Guide</span>
          </h2>
          <p className="text-foreground max-w-2xl mx-auto">
            Get started in minutes with our simple setup process.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          {steps.map((item, index) => (
            <GlowCard key={item.step} className="p-0 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-7 px-5 py-5 sm:px-10 sm:py-8">
                <div className="flex items-center gap-4 sm:gap-7">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
                    <span className="text-sm sm:text-lg font-bold text-primary">{item.step}</span>
                  </div>
                  <div className="flex-1 min-w-0 sm:hidden">
                    <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                    <p className="text-xs text-foreground mt-0.5">{item.description}</p>
                  </div>
                </div>
                <div className="hidden sm:block flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-lg">{item.title}</h3>
                  <p className="text-base text-foreground mt-1">{item.description}</p>
                </div>
                <div className="shrink-0 pl-14 sm:pl-0">
                  {item.type === "invite" ? (
                    <a href="https://discord.com/oauth2/authorize?client_id=1503692598395797575" target="_blank" rel="noopener noreferrer">
                      <span className="text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-md">Invite Bot</span>
                    </a>
                  ) : item.type === "celebrate" ? (
                    <div className="flex items-center text-primary bg-primary/10 px-4 py-2 rounded-md">
                      <span className="text-sm font-medium">{"You're all set!"}</span>
                    </div>
                  ) : item.command ? (
                    <span className="text-sm font-mono text-primary bg-primary/10 px-4 py-2 rounded-md">{item.command}</span>
                  ) : (
                    <ChevronRight className="h-5 w-5 text-primary/40" />
                  )}
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  )
}
