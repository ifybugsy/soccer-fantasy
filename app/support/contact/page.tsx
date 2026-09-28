"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/support">
          <Button variant="ghost" className="mb-6" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Contact Support</CardTitle>
            <p className="text-sm text-muted-foreground">We're here to help. Send us a message.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  required
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  required
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  required
                  type="text"
                  placeholder="How can we help?"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  required
                  placeholder="Tell us more..."
                  rows={6}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>
              <Button type="submit" className="w-full">
                Send Message
              </Button>
              {submitted && (
                <div className="p-4 bg-green-50 text-green-800 rounded-lg">Thank you! We'll get back to you soon.</div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
