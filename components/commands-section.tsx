const commands = [
  "/giveaway-start",
  "/giveaway-end",
  "/giveaway-cancel",
  "/giveaway-reroll",
  "/premium-redeem",
  "/giveaway-schedule",
  "/winners-role",
  "/access-add",
  "/access-remove",
  "/bot-info",
  "/help",
]

export function CommandsSection() {
  return (
    <section id="commands" className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Bot <span className="text-primary">Commands</span>
          </h2>
          <p className="text-foreground max-w-2xl mx-auto">
            Everything you need to run giveaways on your server.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {commands.map((cmd) => (
            <span
              key={cmd}
              className="font-mono text-[11px] sm:text-sm text-foreground border border-primary/50 px-2 py-2.5 sm:px-4 sm:py-3 rounded-md text-center cursor-default"
            >
              {cmd}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
