"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"

const leagues = [
  { id: 1, name: "Elite Premier", members: 234, prizePool: 50000, status: "Active", season: "2025 S1" },
  { id: 2, name: "Gold Division", members: 456, prizePool: 80000, status: "Active", season: "2025 S1" },
  { id: 3, name: "Silver Cup", members: 892, prizePool: 60000, status: "Active", season: "2025 S1" },
  { id: 4, name: "Rookie League", members: 1240, prizePool: 10000, status: "Active", season: "2025 S1" },
]

export default function LeaguesManagementPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">League Management</h1>
            <p className="text-muted-foreground">Manage all active leagues and seasons</p>
          </div>
          <Button className="flex gap-2">
            <Plus size={20} /> Create League
          </Button>
        </div>

        {/* Leagues Table */}
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">League Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Season</th>
                    <th className="text-left py-3 px-4 font-semibold">Members</th>
                    <th className="text-left py-3 px-4 font-semibold">Prize Pool</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leagues.map((league) => (
                    <tr key={league.id} className="border-b border-border hover:bg-accent/5 transition">
                      <td className="py-3 px-4 font-medium">{league.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{league.season}</td>
                      <td className="py-3 px-4">{league.members.toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-primary">${league.prizePool.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge>{league.status}</Badge>
                      </td>
                      <td className="py-3 px-4 space-x-2 flex">
                        <Button size="sm" variant="outline" className="bg-transparent p-2 h-8 w-8">
                          <Edit size={14} />
                        </Button>
                        <Button size="sm" variant="destructive" className="p-2 h-8 w-8">
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
