import { beforeEach, beforeAll, describe, expect, it, vi } from "vitest"

const connectToDatabase = vi.fn()
vi.mock("@/lib/db/mongodb", () => ({ connectToDatabase }))

let paymentService: typeof import("@/lib/db/services/payment.service").paymentService
beforeAll(async () => {
  paymentService = (await import("@/lib/db/services/payment.service")).paymentService
})

describe("payment completion atomicity", () => {
  let payment: { _id: string; id: string; userId: string; amount: number; currency: string; status: "pending" | "completed"; type: "deposit"; providerReference: string }
  let balance: number
  let creditCount: number
  let transactionUpdateCount: number

  beforeEach(() => {
    payment = { _id: "mongo-1", id: "tx-1", userId: "user-1", amount: 5000, currency: "NGN", status: "pending", type: "deposit", providerReference: "dep_123" }
    balance = 10000
    creditCount = 0
    transactionUpdateCount = 0
    connectToDatabase.mockResolvedValue({
      db: {
        collection(name: string) {
          if (name === "transactions") {
            return {
              findOne: vi.fn(async () => payment),
              findOneAndUpdate: vi.fn(async (query: Record<string, unknown>) => {
                if (payment.status !== query.status) return null
                payment.status = "completed"
                transactionUpdateCount++
                return payment
              }),
            }
          }
          return {
            updateOne: vi.fn(async () => { balance += payment.amount; creditCount++; return { modifiedCount: 1 } }),
          }
        },
      },
      client: { startSession: () => ({ withTransaction: async (fn: () => Promise<void>) => fn(), endSession: async () => {} }) },
    })
  })

  it("credits the wallet exactly once and is idempotent on replay", async () => {
    const first = await paymentService.completePaystackDeposit({ reference: "dep_123", amountMinor: 500000, currency: "NGN" })
    const second = await paymentService.completePaystackDeposit({ reference: "dep_123", amountMinor: 500000, currency: "NGN" })

    expect(first.completed).toBe(true)
    expect(second.completed).toBe(false)
    expect(balance).toBe(15000)
    expect(creditCount).toBe(1)
    expect(transactionUpdateCount).toBe(1)
  })
})
