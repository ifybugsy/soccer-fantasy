"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEmailVerification } from "@/lib/hooks/use-email-verification"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export interface EmailVerificationFormProps {
  email: string
  onSuccess?: () => void
}

export function EmailVerificationForm({ email, onSuccess }: EmailVerificationFormProps) {
  const [code, setCode] = useState("")
  const { isLoading, error, success, timeLeft, verifyEmail, resendEmail } = useEmailVerification()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await verifyEmail(email, code)
    if (result && onSuccess) {
      onSuccess()
    }
  }

  const handleResend = async () => {
    await resendEmail(email)
    setCode("")
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-center">Email Verified</CardTitle>
          <CardDescription className="text-center">Your email has been successfully verified</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>Enter the 6-digit code sent to {email}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="000000"
              maxLength={6}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest font-mono"
              required
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Code expires in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </span>
          </div>

          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading || timeLeft === 0}>
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleResend}
              disabled={isLoading || timeLeft > 240}
            >
              {isLoading ? "Sending..." : timeLeft > 240 ? `Resend Code (${timeLeft - 240}s)` : "Resend Code"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
