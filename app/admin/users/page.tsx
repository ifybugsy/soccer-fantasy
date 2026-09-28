"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Edit, Trash2, Lock, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/services/api-client"

interface User {
  id: string
  username: string
  email: string
  country?: string
  dateOfBirth?: string
  status: string
  joinDate: string
  balance: number
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">("synced")

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      setSyncStatus("syncing")
      try {
        const response = await apiClient.get("/v1/admin/users")
        if (response.success && Array.isArray(response.data)) {
          setUsers(response.data)
          setSyncStatus("synced")
        }
      } catch (error) {
        console.error("[v0] Failed to fetch users:", error)
        setSyncStatus("error")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
    const syncInterval = setInterval(fetchUsers, 5000)
    return () => clearInterval(syncInterval)
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch = (user.username || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !filterStatus || user.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-muted-foreground">Manage player accounts and activity</p>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                syncStatus === "synced" ? "bg-green-500" : syncStatus === "syncing" ? "bg-yellow-500" : "bg-red-500"
              }`}
            />
            {syncStatus === "synced" ? "Live Updates" : syncStatus === "syncing" ? "Syncing..." : "Error"}
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex gap-2 bg-transparent">
                <Filter size={16} /> Filter
              </Button>
              <Button>Export</Button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === null ? "default" : "outline"}
              onClick={() => setFilterStatus(null)}
              className={filterStatus === null ? "" : "bg-transparent"}
              size="sm"
            >
              All
            </Button>
            {["Active", "Verified", "Pending", "Suspended"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                onClick={() => setFilterStatus(status)}
                className={filterStatus === status ? "" : "bg-transparent"}
                size="sm"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Username</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Country</th>
                    <th className="text-left py-3 px-4 font-semibold">Date of Birth</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Join Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Balance</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-accent/5 transition">
                      <td className="py-3 px-4 font-medium">{user.username}</td>
                      <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-4 text-muted-foreground">{user.country || "N/A"}</td>
                      <td className="py-3 px-4 text-muted-foreground">{user.dateOfBirth || "N/A"}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            user.status === "Active"
                              ? "default"
                              : user.status === "Suspended"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{user.joinDate}</td>
                      <td className="py-3 px-4 font-semibold">${user.balance}</td>
                      <td className="py-3 px-4 space-x-2 flex">
                        <Button size="sm" variant="outline" className="bg-transparent p-2 h-8 w-8">
                          <Edit size={14} />
                        </Button>
                        <Button size="sm" variant="outline" className="bg-transparent p-2 h-8 w-8">
                          <Lock size={14} />
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
