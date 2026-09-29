import { createHmac } from "node:crypto"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const completePaystackDeposit = vi.fn()
const verifyWebhookSignature = vi.fn()
const connectToDatabase = vi.fn()

vi.mock("@/lib/db/services/payment.service", () => ({
  paymentService: { completePaystackDeposit },
}))
vi.mock("@/lib/paystack/paystack.service", () => ({
  paystackService: { verifyWebhookSignature },
}))
vi.mock("@/lib/db/mongodb", () => ({ connectToDatabase }))

let POST: typeof import("@/app/api/v1/payment/paystack/webhook/route").POST
beforeAll(async () => {
  POST = (await import("@/app/api/v1/payment/paystack/webhook/route")).POST
})

type Payment = {
  _id: string
  id: string
  userId: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed"
  type: "deposit"
  providerReference: string
}

function requestFor(body: string, signature?: string) {
  return new NextRequest("http://localhost/api/v1/payment/paystack/webhook", {
    method: "POST",
    body,
    headers: signature ? { "x-paystack-signature": signature } : undefined,
  })
}

function signedBody(body: string, secret = "test-secret") {
  return createHmac("sha512", secret).update(body).digest("hex")
}

describe("Paystack webhook security", () => {
  beforeEach(() => {
    completePaystackDeposit.mockReset()
    verifyWebhookSignature.mockReset()
    verifyWebhookSignature.mockReturnValue(true)
  })

  it("accepts a valid successful webhook and delegates completion", async () => {
    const body = JSON.stringify({
      event: "charge.success",
      data: { reference: "dep_123", amount: 500000, currency: "NGN", status: "success" },
    })
    completePaystackDeposit.mockResolvedValue({ completed: true })

    const response = await POST(requestFor(body, signedBody(body)))

    expect(response.status).toBe(200)
    expect(completePaystackDeposit).toHaveBeenCalledWith({
      reference: "dep_123",
      amountMinor: 500000,
      currency: "NGN",
      transactionId: undefined,
    })
  })

  it.each([
    ["missing signature", undefined, 401],
    ["invalid signature", "bad-signature", 401],
  ])("rejects %s", async (_label, signature, expectedStatus) => {
    verifyWebhookSignature.mockReturnValue(false)
    const response = await POST(requestFor("{}", signature))
    expect(response.status).toBe(expectedStatus)
    expect(completePaystackDeposit).not.toHaveBeenCalled()
  })

  it.each([
    ["malformed JSON", "{", 400],
    ["missing reference", JSON.stringify({ event: "charge.success", data: { amount: 1, currency: "NGN", status: "success" } }), 400],
    ["lower amount", JSON.stringify({ event: "charge.success", data: { reference: "dep_123", amount: 499999, currency: "NGN", status: "success" } }), 400],
    ["higher amount", JSON.stringify({ event: "charge.success", data: { reference: "dep_123", amount: 500001, currency: "NGN", status: "success" } }), 400],
    ["wrong currency", JSON.stringify({ event: "charge.success", data: { reference: "dep_123", amount: 500000, currency: "USD", status: "success" } }), 400],
  ])("rejects %s safely", async (_label, body, expectedStatus) => {
    completePaystackDeposit.mockRejectedValue(new Error("PAYMENT_DETAILS_MISMATCH"))
    const response = await POST(requestFor(body, "valid-signature"))
    expect(response.status).toBe(expectedStatus)
    expect((await response.json()).error).not.toContain("secret")
  })

  it("rejects a reference mismatch without crediting", async () => {
    completePaystackDeposit.mockRejectedValue(new Error("PAYMENT_NOT_FOUND"))
    const body = JSON.stringify({ event: "charge.success", data: { reference: "unknown", amount: 500000, currency: "NGN", status: "success" } })
    const response = await POST(requestFor(body, "valid-signature"))
    expect(response.status).toBe(400)
    expect(completePaystackDeposit).toHaveBeenCalledTimes(1)
  })

  it("does not credit twice when completion reports an already processed event", async () => {
    completePaystackDeposit
      .mockResolvedValueOnce({ completed: true })
      .mockResolvedValueOnce({ completed: false })
    const body = JSON.stringify({ event: "charge.success", data: { reference: "dep_123", amount: 500000, currency: "NGN", status: "success" } })

    expect((await POST(requestFor(body, "valid-signature"))).status).toBe(200)
    expect((await POST(requestFor(body, "valid-signature"))).status).toBe(200)
    expect(completePaystackDeposit).toHaveBeenCalledTimes(2)
    expect(completePaystackDeposit.mock.results[1].value).toBeInstanceOf(Promise)
  })
})
