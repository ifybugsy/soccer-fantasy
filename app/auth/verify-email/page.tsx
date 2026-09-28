"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { useEmailVerification } from "@/lib/hooks/use-email-verification"

export default function VerifyEmail() {
  const [code, setCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const { isLoading, error, success, timeLeft, sendVerificationEmail, verifyEmail, resendEmail } =
    useEmailVerification()

  // Send verification email on mount
  useEffect(() => {
    if (email && !success && timeLeft === 0) {
      sendVerificationEmail(email)
    }
  }, [email, sendVerificationEmail, success, timeLeft])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifying(true)

    const result = await verifyEmail(email, code)
    if (result) {
      // Redirect to login after successful verification
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    }
    setVerifying(false)
  }

  const handleResendCode = async () => {
    await resendEmail(email)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
            <CardTitle className="text-center">Email Verified</CardTitle>
            <CardDescription className="text-center">Your account has been successfully verified</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>Enter the verification code sent to {email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded text-sm flex gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest"
                required
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Code expires in: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || verifying || timeLeft === 0}>
              {isLoading || verifying ? "Verifying..." : "Verify Email"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleResendCode}
              disabled={isLoading || timeLeft > 240}
            >
              {isLoading ? "Sending..." : timeLeft > 240 ? "Resend Code (expires in 5 min)" : "Resend Code"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
