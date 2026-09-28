"use client"

import type React from "react"
import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/services/api-client"

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const isSubmittingRef = useRef(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmittingRef.current || loading) {
      return
    }

    isSubmittingRef.current = true
    setError("")
    setLoading(true)

    try {
      const response = await apiClient.post("/v1/auth/login", formData)

      if (!response.success) {
        if (response.data?.requiresVerification) {
          router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)
          return
        }

        setError(response.error || "Login failed")
        return
      }

      if (response.data?.token) {
        localStorage.setItem("auth_token", response.data.token)
      }

      router.push("/dashboard")
    } catch (err) {
      setError("An error occurred during login")
    } finally {
      setLoading(false)
      isSubmittingRef.current = false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link href="/">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Home
            </button>
          </Link>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-lg p-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground text-sm mb-8">Login to your Soccer Fantasy account</p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-center mt-6">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
