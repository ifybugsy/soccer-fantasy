"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LiveStreamButton } from "@/components/live-stream-button"
import Image from "next/image"

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
      <div className="absolute inset-0 opacity-20">
        <Image src="/images/peakpx.jpg" alt="eFootball background" fill className="object-cover" priority />
      </div>

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-slide-in space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1 bg-accent/20 rounded-full text-accent font-semibold text-sm">
                Play Fantasy Football Online
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance leading-tight">
                Compete, Win & Earn Real Rewards
              </h1>
              <p className="text-lg text-muted-foreground text-balance max-w-xl">
                Join thousands of football enthusiasts in competitive fantasy leagues. Build your team, match with
                players, and climb the leaderboards for real prizes.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Start Playing Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
              <LiveStreamButton size="md" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div>
                <p className="text-2xl font-bold text-primary">10K+</p>
                <p className="text-sm text-muted-foreground">Active Players</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Live Leagues</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">$2M+</p>
                <p className="text-sm text-muted-foreground">Prizes Awarded</p>
              </div>
            </div>
          </div>

          {/* Right - Hero Image with eFootball graphic */}
          <div className="hidden md:block relative h-full min-h-96 rounded-2xl overflow-hidden border-2 border-primary/20">
            <Image
              src="/efootball-stats.jpg"
              alt="eFootball player statistics"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-start p-6">
              <div className="text-white">
                <h3 className="text-lg font-bold">Premium Football Experience</h3>
                <p className="text-sm">Real-time player stats and live updates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
