import axios from "axios"

const PAYSTACK_BASE_URL = "https://api.paystack.co"

export class PaystackService {
  private secretKey: string

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || ""
  }

  async initializePayment(email: string, amount: number, reference: string): Promise<any> {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Paystack accepts amount in kobo
          reference,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        },
      )

      console.log("[v0] Paystack initialization response:", response.data)
      return response.data
    } catch (error: any) {
      console.error("[v0] Paystack initialization error:", error.response?.data || error.message)
      throw new Error(`Paystack initialization failed: ${error.response?.data?.message || error.message}`)
    }
  }

  async verifyPayment(reference: string): Promise<any> {
    try {
      const response = await axios.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      })

      console.log("[v0] Paystack verification response:", response.data)
      return response.data
    } catch (error: any) {
      console.error("[v0] Paystack verification error:", error.response?.data || error.message)
      throw new Error(`Paystack verification failed: ${error.response?.data?.message || error.message}`)
    }
  }

  async createTransferRecipient(accountNumber: string, bankCode: string, accountName: string): Promise<any> {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transferrecipient`,
        {
          type: "nuban",
          account_number: accountNumber,
          bank_code: bankCode,
          name: accountName,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        },
      )

      return response.data
    } catch (error: any) {
      console.error("[v0] Transfer recipient creation error:", error.response?.data || error.message)
      throw new Error(`Transfer recipient creation failed: ${error.response?.data?.message || error.message}`)
    }
  }

  async initiateTransfer(amount: number, recipientCode: string, reason: string): Promise<any> {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transfer`,
        {
          source: "balance",
          reason,
          amount: amount * 100,
          recipient: recipientCode,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        },
      )

      return response.data
    } catch (error: any) {
      console.error("[v0] Transfer initiation error:", error.response?.data || error.message)
      throw new Error(`Transfer initiation failed: ${error.response?.data?.message || error.message}`)
    }
  }

  verifySignature(signature: string, body: any): boolean {
    const crypto = require("crypto")
    const hash = crypto.createHmac("sha512", this.secretKey).update(JSON.stringify(body)).digest("hex")

    return hash === signature
  }
}
