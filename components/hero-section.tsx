import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-8">
            <span>The #1 Discord Giveaway Bot</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
            <span className="block">Create Amazing</span>
            <span className="block text-primary drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]">
              Giveaways
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-foreground mb-10">
            Engage your community with powerful giveaways. Easy setup, beautiful embeds, 
            and advanced features to make your server thrive.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://discord.com/oauth2/authorize?client_id=1503692598395797575" target="_blank" rel="noopener noreferrer">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-black/60 backdrop-blur-sm border border-primary/30 text-primary hover:bg-black/70 hover:border-primary/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
              >
                Add to Discord
              </Button>
            </a>
            <a href="https://discord.gg/EuWYYbHwmv" target="_blank" rel="noopener noreferrer">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-black/60 backdrop-blur-sm border border-primary/30 text-primary hover:bg-black/70 hover:border-primary/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
              >
                Support Server
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
