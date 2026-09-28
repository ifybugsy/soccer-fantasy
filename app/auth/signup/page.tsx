"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/services/api-client"

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    eFootballCode: "",
    country: "",
    dateOfBirth: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (!formData.username?.trim()) {
      setError("Username is required")
      setLoading(false)
      return
    }
    if (!formData.email?.trim()) {
      setError("Email is required")
      setLoading(false)
      return
    }
    if (!formData.password?.trim()) {
      setError("Password is required")
      setLoading(false)
      return
    }
    if (!formData.eFootballCode?.trim()) {
      setError("eFootball code is required")
      setLoading(false)
      return
    }
    if (!formData.country) {
      setError("Country is required")
      setLoading(false)
      return
    }
    if (!formData.dateOfBirth) {
      setError("Date of birth is required")
      setLoading(false)
      return
    }

    try {
      const response = await apiClient.post("/v1/auth/register", {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        eFootballCode: formData.eFootballCode.trim(),
        country: formData.country,
        dateOfBirth: formData.dateOfBirth,
      })

      if (!response.success) {
        setError(response.error || response.data?.error || "Sign up failed")
        setLoading(false)
        return
      }

      const loginResponse = await apiClient.post("/v1/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      })

      if (loginResponse.success) {
        if (loginResponse.data?.token) {
          localStorage.setItem("auth_token", loginResponse.data.token)
        }
        router.push("/dashboard")
      } else {
        router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)
      }
    } catch (err) {
      console.error("[v0] Sign up error:", err)
      setError("An error occurred - please try again")
      setLoading(false)
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground text-sm mb-8">Join Soccer Fantasy today</p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">eFootball User Code</label>
              <input
                type="text"
                name="eFootballCode"
                value={formData.eFootballCode}
                onChange={handleChange}
                placeholder="e.g., ABC123XYZ"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Your eFootball profile code for player merging</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Select a country</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Ghana">Ghana</option>
                <option value="Kenya">Kenya</option>
                <option value="South Africa">South Africa</option>
                <option value="Egypt">Egypt</option>
                <option value="Uganda">Uganda</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Ethiopia">Ethiopia</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-sm text-center mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
