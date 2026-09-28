"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, LogIn, UserPlus } from "lucide-react"
import Link from "next/link"

export default function JoinCupPage({ params }: { params: { cupId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  const cupName = searchParams.get("cupName") || "Cup"
  const entryFee = Number.parseInt(searchParams.get("entryFee") || "0")
  const prize = Number.parseInt(searchParams.get("prize") || "0")

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        setIsAuthenticated(!!token)
      } catch (error) {
        console.error("[v0] Auth check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link href="/cups">
            <Button variant="outline" size="sm" className="gap-2 mb-8 bg-transparent hover:bg-primary/10">
              <ArrowLeft size={16} /> Back to Cups
            </Button>
          </Link>

          {/* Cup Info Card */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-accent" />
                <CardTitle className="text-2xl">{cupName}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Entry Fee</p>
                <p className="text-2xl font-bold text-primary">₦{entryFee.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Prize Pool</p>
                <p className="text-2xl font-bold text-accent">₦{prize.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Authentication Required */}
          <div className="space-y-4">
            <p className="text-center text-muted-foreground mb-6">
              To join this cup, you need to create an account or log in to your existing account.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Sign Up Option */}
              <Card className="hover:border-accent/50 transition cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-center mb-2">New Player</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Create a new account and start playing
                  </p>
                  <Link href="/auth/signup" className="block">
                    <Button className="w-full">Create Account</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Login Option */}
              <Card className="hover:border-primary/50 transition cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <LogIn className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-center mb-2">Existing Player</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">Log in to your account to continue</p>
                  <Link href="/auth/login" className="block">
                    <Button variant="outline" className="w-full bg-transparent">
                      Log In
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/cups">
          <Button variant="outline" size="sm" className="gap-2 mb-8 bg-transparent hover:bg-primary/10">
            <ArrowLeft size={16} /> Back to Cups
          </Button>
        </Link>

        {/* Redirecting to Payment */}
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-muted-foreground">Redirecting to payment...</p>
        </div>

        <script>
          {`
            const cupId = "${params.cupId}";
            const entryFee = ${entryFee};
            window.location.href = \`/dashboard/wallet/cup-payment?cupId=\${cupId}&entryFee=\${entryFee}&cupName=${encodeURIComponent(cupName)}\`;
          `}
        </script>
      </div>
    </div>
  )
}
