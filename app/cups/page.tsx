"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Clock3, Coins, Gamepad2, Trophy, Users, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Cup {
  id: string
  name: string
  description?: string
  entryFee: number
  participantCount: number
  prizePool: number
  maxParticipants?: number
  startAt: string
  endAt: string
  status: string
}

function Countdown({ endAt }: { endAt: string }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(endAt).getTime() - Date.now()))
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(Math.max(0, new Date(endAt).getTime() - Date.now())), 1000)
    return () => window.clearInterval(timer)
  }, [endAt])
  const seconds = Math.floor(remaining / 1000)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return <span>{days ? `${days}d ` : ""}{String(hours).padStart(2, "0")}h {String(minutes).padStart(2, "0")}m</span>
}

export default function CupsPage() {
  const [cups, setCups] = useState<Cup[]>([])
  const [serverTime, setServerTime] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch("/api/cups", { cache: "no-store" }).then((response) => response.json()).then((body) => {
      setCups(body.data ?? [])
      setServerTime(body.serverTime ?? null)
    }).catch(() => setMessage("Cups are unavailable right now.")).finally(() => setLoading(false))
  }, [])

  const activeCups = useMemo(() => cups.filter((cup) => ["REGISTRATION_OPEN", "ACTIVE"].includes(cup.status)), [cups])
  const formatNaira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`

  return (
    <main className="min-h-screen bg-[#07100d] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"><ArrowLeft className="size-4" /> Soccer Fantasy</Link>
          <Link href="/dashboard" className="text-sm font-medium text-[#a9f95d] hover:text-white">My dashboard</Link>
        </header>

        <section className="mb-10 max-w-3xl">
          <div className="mb-4 flex items-center gap-2 text-[#a9f95d]"><Gamepad2 className="size-5" /><span className="text-xs font-bold uppercase tracking-[0.24em]">PES competitive cups</span></div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Play for fun.<br /><span className="text-[#a9f95d]">Compete. Win real rewards.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/60">Enter skill-based PES tournaments, submit verified match results, and climb the live leaderboard. Prize pools are calculated from real entries.</p>
        </section>

        <div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Live competition board</p><h2 className="mt-2 text-2xl font-semibold">Mini Cups &amp; Tournaments</h2></div><div className="hidden items-center gap-2 text-xs text-white/40 sm:flex"><span className="size-2 rounded-full bg-[#a9f95d]" /> Database-backed updates {serverTime ? "· synced" : ""}</div></div>

        {loading ? <div className="grid gap-4 md:grid-cols-3"><div className="h-72 animate-pulse rounded-2xl bg-white/10" /><div className="h-72 animate-pulse rounded-2xl bg-white/10" /><div className="h-72 animate-pulse rounded-2xl bg-white/10" /></div> : activeCups.length === 0 ? <Card className="border-white/10 bg-white/[0.04] text-white"><CardContent className="flex flex-col items-center justify-center py-16 text-center"><Trophy className="mb-4 size-10 text-[#a9f95d]" /><h3 className="text-xl font-semibold">No cups are open yet</h3><p className="mt-2 max-w-md text-sm text-white/50">Check back soon for the next admin-created PES competition.</p>{message && <p className="mt-4 text-sm text-red-300">{message}</p>}</CardContent></Card> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{activeCups.map((cup) => <Card key={cup.id} className="overflow-hidden border-white/10 bg-white/[0.05] text-white transition hover:-translate-y-1 hover:border-[#a9f95d]/50"><CardContent className="p-6"><div className="mb-8 flex items-center justify-between"><Badge className="border-[#a9f95d]/30 bg-[#a9f95d]/10 text-[#a9f95d]">{cup.status === "ACTIVE" ? "ACTIVE" : "REGISTRATION OPEN"}</Badge><Zap className="size-5 text-[#a9f95d]" /></div><h3 className="text-2xl font-semibold">{cup.name}</h3><p className="mt-2 min-h-10 text-sm text-white/50">{cup.description || "Compete against PES players for a share of the prize pool."}</p><div className="mt-7 grid grid-cols-2 gap-4"><div><p className="text-xs text-white/40">Prize pool</p><p className="mt-1 text-xl font-semibold text-[#a9f95d]">{formatNaira(cup.prizePool)}</p></div><div><p className="text-xs text-white/40">Entry fee</p><p className="mt-1 text-xl font-semibold">{formatNaira(cup.entryFee)}</p></div><div className="flex items-center gap-2 text-sm text-white/60"><Users className="size-4" /> {cup.participantCount}{cup.maxParticipants ? ` / ${cup.maxParticipants}` : ""}</div><div className="flex items-center gap-2 text-sm text-white/60"><Clock3 className="size-4" /> <Countdown endAt={cup.endAt} /></div></div><Button asChild className="mt-7 w-full bg-[#a9f95d] font-semibold text-[#07100d] hover:bg-white"><Link href={`/cups/join/${cup.id}`}>Join cup</Link></Button></CardContent></Card>)}</div>}

        <section className="mt-12 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><Coins className="mb-5 size-5 text-[#a9f95d]" /><p className="font-medium">Fund your wallet</p><p className="mt-1 text-sm text-white/50">Secure deposits and transparent transaction history.</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><Gamepad2 className="mb-5 size-5 text-[#a9f95d]" /><p className="font-medium">Play your matches</p><p className="mt-1 text-sm text-white/50">Your PES identity and assigned matches stay tied to your account.</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><Trophy className="mb-5 size-5 text-[#a9f95d]" /><p className="font-medium">Climb the board</p><p className="mt-1 text-sm text-white/50">Verified results power the authoritative leaderboard.</p></div></section>
      </div>
    </main>
  )
}
