import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">Soccer Fantasy</h3>
            <p className="text-sm text-muted-foreground">Competitive fantasy football for everyone</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/leagues" className="hover:text-primary">
                  Leagues
                </Link>
              </li>
              <li>
                <Link href="/cups" className="hover:text-primary">
                  Cups
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-primary">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/support" className="hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/support/contact" className="hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/support/faq" className="hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-primary">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/responsible-gaming" className="hover:text-primary">
                  Responsible Gaming
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Soccer Fantasy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
