"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Youtube, Facebook } from "lucide-react"

interface LiveStreamButtonProps {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline"
}

export function LiveStreamButton({ size = "md", variant = "default" }: LiveStreamButtonProps) {
  const [showOptions, setShowOptions] = useState(false)

  const handleYoutubeLive = () => {
    // Open YouTube Live Stream
    window.open("https://youtube.com/live_dashboard", "_blank")
    setShowOptions(false)
  }

  const handleFacebookLive = () => {
    // Open Facebook Live Stream
    window.open("https://facebook.com/live_producer", "_blank")
    setShowOptions(false)
  }

  const buttonSizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  }

  const sizeClass = buttonSizeClasses[size]

  if (showOptions) {
    return (
      <div className="relative">
        <div className="absolute bottom-full mb-2 left-0 right-0 z-50">
          <Card className="shadow-lg">
            <CardContent className="p-2 space-y-1">
              <Button
                onClick={handleYoutubeLive}
                variant="ghost"
                className="w-full justify-start text-left flex gap-2 hover:bg-accent"
              >
                <Youtube size={18} className="text-red-600" />
                YouTube Live
              </Button>
              <Button
                onClick={handleFacebookLive}
                variant="ghost"
                className="w-full justify-start text-left flex gap-2 hover:bg-accent"
              >
                <Facebook size={18} className="text-blue-600" />
                Facebook Live
              </Button>
              <Button
                onClick={() => setShowOptions(false)}
                variant="ghost"
                className="w-full justify-start text-left hover:bg-accent"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowOptions(false)}
          className={`${sizeClass} bg-transparent w-full`}
        >
          Close
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={() => setShowOptions(true)}
      variant={variant}
      className={`${sizeClass} flex gap-2 bg-red-600 hover:bg-red-700 text-white`}
    >
      📡 Live Stream
    </Button>
  )
}
