"use client"

import { useState, useCallback } from "react"
import { apiClient } from "@/lib/services/api-client"

export interface AuthUser {
  userId: string
  username: string
  email: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const register = useCallback(async (email: string, username: string, password: string, eFootballCode: string) => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await apiClient.post("/v1/auth/register", {
        email,
        username,
        password,
        eFootballCode,
      })

      if (!response.success) {
        throw new Error(response.error || "Registration failed")
      }

      return { success: true, userId: response.data?.userId }
    } catch (err: any) {
      const errorMsg = err.message || "Registration failed"
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await apiClient.post("/v1/auth/login", {
        email,
        password,
      })

      if (!response.success) {
        // Check if email verification is needed
        if (response.data?.requiresVerification) {
          return {
            success: false,
            requiresVerification: true,
            email: response.data.email,
          }
        }
        throw new Error(response.error || "Login failed")
      }

      setUser(response.data as AuthUser)
      return { success: true }
    } catch (err: any) {
      const errorMsg = err.message || "Login failed"
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setError(null)
  }, [])

  return {
    user,
    isLoading,
    error,
    register,
    login,
    logout,
  }
}
