import { type NextRequest, NextResponse } from "next/server"

// In-memory wallet store (replace with MongoDB in production)
const wallets: Map<string, any> = new Map()

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 })
  }

  let wallet = wallets.get(userId)
  if (!wallet) {
    wallet = {
      userId,
      balance: 0,
      currency: "USD",
      deposits: [],
      withdrawals: [],
      earnings: [],
    }
    wallets.set(userId, wallet)
  }

  return NextResponse.json(wallet)
}

export async function POST(request: NextRequest) {
  const { action, userId, amount, type } = await request.json()

  const wallet = wallets.get(userId) || {
    userId,
    balance: 0,
    currency: "USD",
    deposits: [],
    withdrawals: [],
    earnings: [],
  }

  if (action === "deposit") {
    wallet.balance += amount
    wallet.deposits.push({ amount, date: new Date(), status: "completed" })
  } else if (action === "withdraw") {
    if (wallet.balance >= amount) {
      wallet.balance -= amount
      wallet.withdrawals.push({ amount, date: new Date(), status: "completed" })
    } else {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }
  }

  wallets.set(userId, wallet)
  return NextResponse.json({ success: true, wallet })
}
