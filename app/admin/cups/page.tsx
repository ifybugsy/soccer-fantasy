"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Plus, Edit2, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const activeCups = [
  { id: 1, name: "Daily Cup", entries: 156, prizePool: "$5,000", status: "Active", tier: "Daily" },
  { id: 2, name: "Weekly Championship", entries: 542, prizePool: "$25,000", status: "Active", tier: "Weekly" },
  { id: 3, name: "Monthly Elite", entries: 89, prizePool: "$50,000", status: "Active", tier: "Monthly" },
]

export default function CupsManagementPage() {
  const [cups, setCups] = useState(activeCups)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleDeleteCup = (id: number) => {
    if (confirm("Are you sure you want to delete this cup?")) {
      setCups(cups.filter((cup) => cup.id !== id))
      alert("Cup deleted successfully")
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Tournaments & Cups Management</h1>
              <p className="text-muted-foreground">Create and manage all tournament cups</p>
            </div>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="flex gap-2">
            <Plus size={16} /> Create New Cup
          </Button>
        </div>

        <div className="grid gap-4">
          {cups.map((cup) => (
            <Card key={cup.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-accent" />
                  <div>
                    <CardTitle className="text-lg">{cup.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{cup.tier} Tournament</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    {cup.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Entries</p>
                    <p className="text-xl font-bold">{cup.entries}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prize Pool</p>
                    <p className="text-xl font-bold">{cup.prizePool}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-xl font-bold">{cup.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => alert("Edit cup: " + cup.name)}>
                      <Edit2 size={16} className="mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCup(cup.id)}>
                      <Trash2 size={16} className="mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Create New Cup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cup Name</label>
                  <input
                    type="text"
                    placeholder="Enter cup name"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tournament Tier</label>
                  <select className="w-full px-3 py-2 border border-border rounded-md bg-background">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Elite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Prize Pool ($)</label>
                  <input
                    type="number"
                    placeholder="Enter prize pool amount"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      alert("Cup created successfully!")
                      setShowCreateModal(false)
                    }}
                  >
                    Create Cup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
