"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { TrendingUp, Users, DollarSign, Award, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const playerGrowthData = [
  { month: "Jan", players: 1200, active: 800 },
  { month: "Feb", players: 1900, active: 1200 },
  { month: "Mar", players: 2400, active: 1600 },
  { month: "Apr", players: 3100, active: 2200 },
  { month: "May", players: 4200, active: 3100 },
  { month: "Jun", players: 5234, active: 3800 },
]

const revenueData = [
  { source: "League Fees", value: 45000 },
  { source: "Cup Entry", value: 28000 },
  { source: "Withdrawals Fee", value: 15000 },
  { source: "Premium Pass", value: 12000 },
]

const COLORS = ["hsl(var(--color-primary))", "hsl(var(--color-accent))", "hsl(var(--color-secondary))", "#fbbf24"]

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Platform Analytics</h1>
            <p className="text-muted-foreground">Comprehensive platform performance metrics</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$100,000</p>
              <p className="text-xs text-green-600">+15% vs last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Players</CardTitle>
              <Users className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3,800</p>
              <p className="text-xs text-green-600">+8% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
              <TrendingUp className="w-4 h-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">42m</p>
              <p className="text-xs text-green-600">+5 mins vs avg</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Matches</CardTitle>
              <Award className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">12,543</p>
              <p className="text-xs text-green-600">+320 today</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Player Growth Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={playerGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="players"
                    stroke="hsl(var(--color-primary))"
                    strokeWidth={2}
                    name="Total Players"
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="hsl(var(--color-accent))"
                    strokeWidth={2}
                    name="Active Players"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
