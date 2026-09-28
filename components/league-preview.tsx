"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/services/api-client"
import { Loader2 } from "lucide-react"

const leaguesData = [
  { name: "Elite Premier", stakes: "$100-$500", members: 234, status: "Active", id: 1 },
  { name: "Gold Division", stakes: "$50-$200", members: 456, status: "Active", id: 2 },
  { name: "Silver Cup", stakes: "$10-$50", members: 892, status: "Active", id: 3 },
  { name: "Rookie League", stakes: "Free", members: 1240, status: "Active", id: 4 },
]

export function LeaguePreview() {
  const [leagues, setLeagues] = useState<any[]>(leaguesData)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get("/leagues?limit=4")
        if (response.success && Array.isArray(response.data)) {
          setLeagues(response.data)
        }
      } catch (error) {
        // Silently fail and show fallback data
      } finally {
        setLoading(false)
      }
    }

    fetchLeagues()
  }, [])

  if (loading) {
    return (
      <section id="leagues" className="py-20 sm:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </section>
    )
  }

  return (
    <section id="leagues" className="py-20 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Browse Leagues</h2>
          <p className="text-muted-foreground text-lg">Choose your level and join thousands of competitors</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {leagues.map((league) => (
            <Card key={league.id} className="hover:shadow-md transition-all hover:border-primary/50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{league.name}</CardTitle>
                  <Badge variant="secondary">{league.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Stakes</p>
                  <p className="font-semibold text-accent">{league.stakes}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="font-semibold">{league.members.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
