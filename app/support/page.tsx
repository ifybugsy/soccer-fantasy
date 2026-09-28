import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle, MessageSquare, BookOpen, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-muted-foreground mb-8">Get answers and support for Soccer Fantasy</p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <HelpCircle className="w-8 h-8 text-primary mb-2" />
              <CardTitle>FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Find answers to frequently asked questions</p>
              <Link href="/support/faq">
                <Button variant="outline" className="w-full bg-transparent">
                  View FAQ
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Get help from our support team</p>
              <Link href="/support/contact">
                <Button variant="outline" className="w-full bg-transparent">
                  Contact Us
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="w-8 h-8 text-secondary mb-2" />
              <CardTitle>Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Learn how to use Soccer Fantasy</p>
              <Button variant="outline" className="w-full bg-transparent" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <AlertCircle className="w-8 h-8 text-destructive mb-2" />
              <CardTitle>Report Issue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Report bugs or problems</p>
              <Button variant="outline" className="w-full bg-transparent" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
