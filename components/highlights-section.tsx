import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Zap, Users, Coins } from "lucide-react"
import Image from "next/image"

const features = [
  {
    icon: Trophy,
    title: "League Tables",
    description: "Real-time standings and comprehensive stats tracking for all leagues",
    image: "/league-trophy.jpg",
  },
  {
    icon: Zap,
    title: "Quick Matches",
    description: "Auto-matching system pairs you with players of similar skill levels",
  },
  {
    icon: Users,
    title: "Mini Cups",
    description: "Tournament-style competitions with special rewards and visual trophies",
  },
  {
    icon: Coins,
    title: "Earn & Withdraw",
    description: "Multiple earning opportunities with real cash withdrawal options",
  },
]

export function HighlightsSection() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Soccer Fantasy?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the next generation of fantasy football with modern design, real-time updates, and genuine
            rewards
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <Card key={i} className="hover:shadow-lg transition-shadow overflow-hidden">
                {feature.image && (
                  <div className="relative h-32 overflow-hidden">
                    <Image
                      src={feature.image || "/placeholder.svg"}
                      alt={feature.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
