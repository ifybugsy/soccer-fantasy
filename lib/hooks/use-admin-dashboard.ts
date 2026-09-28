"use client"

import { useState, useEffect, useCallback } from "react"
import { adminClient, type AdminStats, type AdminUser } from "@/lib/services/admin-client"

export function useAdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ skip: 0, limit: 50, total: 0 })

  const loadUsers = useCallback(
    async (skip = 0) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await adminClient.getUsers(skip, pagination.limit)

        if (!response.success) {
          throw new Error(response.error || "Failed to load users")
        }

        setUsers(response.data || [])
        if (response.data?.pagination) {
          setPagination(response.data.pagination)
        }
      } catch (err: any) {
        const errorMsg = err.message || "Failed to load users"
        setError(errorMsg)
        console.error("[v0] Load users error:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [pagination.limit],
  )

  const loadStats = useCallback(async () => {
    try {
      const response = await adminClient.getDashboardStats()

      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (err: any) {
      console.error("[v0] Load stats error:", err)
    }
  }, [])

  const performUserAction = useCallback(
    async (userId: string, action: string, data?: any) => {
      try {
        const response = await adminClient.updateUser(userId, action, data)

        if (!response.success) {
          throw new Error(response.error || "Action failed")
        }

        // Reload users
        await loadUsers(pagination.skip)
        return true
      } catch (err: any) {
        console.error("[v0] User action error:", err)
        setError(err.message || "Action failed")
        return false
      }
    },
    [loadUsers, pagination.skip],
  )

  // Load initial data
  useEffect(() => {
    loadUsers()
    loadStats()
  }, [loadUsers, loadStats])

  return {
    users,
    stats,
    isLoading,
    error,
    pagination,
    loadUsers,
    loadStats,
    performUserAction,
  }
}
