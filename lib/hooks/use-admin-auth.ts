"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  setAdminToken,
  getAdminToken,
  clearAdminToken,
  isAdminAuthenticated,
  getAdminInfo,
} from "@/lib/admin/admin-session"
import { apiClient } from "@/lib/services/api-client"

export function useAdminAuth() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminInfo, setAdminInfo] = useState<{ userId: string; role: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = isAdminAuthenticated()
      setIsAuthenticated(authenticated)

      if (authenticated) {
        const info = getAdminInfo()
        setAdminInfo(info)
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = useCallback(
    async (username: string, password: string) => {
      setError(null)
      setIsLoading(true)

      try {
        const response = await apiClient.post("/v1/auth/admin-login", {
          username,
          password,
        })

        if (!response.success || !response.data?.token) {
          throw new Error(response.error || "Login failed")
        }

        setAdminToken(response.data.token)
        setIsAuthenticated(true)

        const info = getAdminInfo()
        setAdminInfo(info)

        router.push("/admin")
      } catch (err: any) {
        const errorMsg = err.message || "Login failed"
        setError(errorMsg)
      } finally {
        setIsLoading(false)
      }
    },
    [router],
  )

  const logout = useCallback(async () => {
    try {
      const token = getAdminToken()
      if (token) {
        await apiClient.post("/v1/admin/auth/logout", {})
      }
    } catch (error) {
      // Silently fail on logout error
    } finally {
      clearAdminToken()
      setIsAuthenticated(false)
      setAdminInfo(null)
      router.push("/admin/login")
    }
  }, [router])

  return {
    isAuthenticated,
    isLoading,
    adminInfo,
    error,
    login,
    logout,
  }
}
