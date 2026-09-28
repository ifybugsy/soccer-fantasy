import { HeroSection } from "@/components/hero-section"
import { Navbar } from "@/components/navbar"
import { HighlightsSection } from "@/components/highlights-section"
import { LeaguePreview } from "@/components/league-preview"
import { CTA } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HighlightsSection />
      <LeaguePreview />
      <CTA />
      <Footer />
    </main>
  )
}
