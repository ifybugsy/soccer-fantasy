"use client"

import { useState, useCallback } from "react"
import { emailService } from "@/lib/services/email-service"

export function useEmailVerification() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  const sendVerificationEmail = useCallback(async (email: string) => {
    setError(null)
    setIsLoading(true)

    try {
      const result = await emailService.sendVerificationEmail(email)

      if (!result.success) {
        throw new Error(result.error || "Failed to send verification email")
      }

      setSuccess(true)
      setTimeLeft(30 * 60) // 30 minutes

      // Start countdown
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return true
    } catch (err: any) {
      const errorMsg = err.message || "Failed to send verification email"
      setError(errorMsg)
      console.error("[v0] Send verification error:", err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const verifyEmail = useCallback(async (email: string, code: string) => {
    setError(null)
    setIsLoading(true)

    try {
      const result = await emailService.verifyEmail(email, code)

      if (!result.success) {
        throw new Error(result.error || "Verification failed")
      }

      setSuccess(true)
      return true
    } catch (err: any) {
      const errorMsg = err.message || "Verification failed"
      setError(errorMsg)
      console.error("[v0] Verify email error:", err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resendEmail = useCallback(async (email: string) => {
    setError(null)
    setIsLoading(true)

    try {
      const result = await emailService.resendVerificationEmail(email)

      if (!result.success) {
        throw new Error(result.error || "Failed to resend verification email")
      }

      setTimeLeft(30 * 60) // Reset countdown
      return true
    } catch (err: any) {
      const errorMsg = err.message || "Failed to resend verification email"
      setError(errorMsg)
      console.error("[v0] Resend email error:", err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    success,
    timeLeft,
    sendVerificationEmail,
    verifyEmail,
    resendEmail,
  }
}
