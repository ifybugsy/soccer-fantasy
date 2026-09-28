"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SF</span>
            </div>
            <span className="hidden sm:inline font-bold text-lg">Soccer Fantasy</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/leagues" className="text-foreground hover:text-primary transition">
              Leagues
            </Link>
            <Link href="/players" className="text-foreground hover:text-primary transition">
              Players
            </Link>
            <Link href="/cups" className="text-foreground hover:text-primary transition">
              Cups
            </Link>
            <Link href="/leaderboard" className="text-foreground hover:text-primary transition">
              Leaderboard
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            <Link href="/leagues" className="block py-2 text-foreground hover:text-primary">
              Leagues
            </Link>
            <Link href="/players" className="block py-2 text-foreground hover:text-primary">
              Players
            </Link>
            <Link href="/cups" className="block py-2 text-foreground hover:text-primary">
              Cups
            </Link>
            <Link href="/leaderboard" className="block py-2 text-foreground hover:text-primary">
              Leaderboard
            </Link>
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
