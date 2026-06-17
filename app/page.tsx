import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { CommandsSection } from "@/components/commands-section"
import { PremiumSection } from "@/components/premium-section"
import { SetupSection } from "@/components/setup-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CommandsSection />
      <PremiumSection />
      <SetupSection />
      <Footer />
    </main>
  )
}
