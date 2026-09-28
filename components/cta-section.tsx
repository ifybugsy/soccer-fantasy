import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTA() {
  return (
    <section className="py-20 sm:py-32 bg-gradient-to-r from-primary/20 to-accent/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Play?</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Join the Soccer Fantasy revolution and start winning real rewards today
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/auth/signup">Sign Up Now</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
