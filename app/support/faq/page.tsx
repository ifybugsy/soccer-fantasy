import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const faqs = [
  {
    q: "How do I join a league?",
    a: "Navigate to the Leagues section, browse available leagues, and click 'Join' to participate. You'll need to pay the league entry fee if applicable.",
  },
  {
    q: "What are the withdrawal fees?",
    a: "Soccer Fantasy applies a 5% platform fee on all withdrawals. This helps us maintain and improve the platform.",
  },
  {
    q: "How are rankings calculated?",
    a: "Rankings are based on your total points from matches won, goal scorers selected, and tournament performance.",
  },
  {
    q: "Can I merge multiple accounts?",
    a: "Yes, you can link your eFootball account during registration. Use your eFootball player code to merge accounts.",
  },
  {
    q: "How do I contact support?",
    a: "Use the 'Contact Support' page in the Help Center or email our support team for assistance.",
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/support">
          <Button variant="ghost" className="mb-6" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mb-8">Find quick answers to common questions</p>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-base">{faq.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
