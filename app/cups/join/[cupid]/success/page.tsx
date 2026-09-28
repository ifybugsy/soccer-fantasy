"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function JoinCupSuccessPage() {
  const params = useParams()
  const cupId = params.cupId

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-6">You have successfully joined the tournament. Good luck!</p>

          <div className="space-y-3">
            <Link href="/dashboard" className="block">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
            <Link href="/cups" className="block">
              <Button variant="outline" className="w-full bg-transparent">
                Back to Cups
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
