import crypto from "crypto"

export const paystackService = {
  // Initialize a payment transaction
  async initializePayment(amount: number, email: string, metadata: any = {}) {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured")
    }

    try {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount * 100, // Paystack expects amount in kobo (cents)
          email,
          metadata,
        }),
      })

      const data = await response.json()

      if (!data.status) {
        throw new Error(data.message || "Failed to initialize payment")
      }

      return {
        success: true,
        reference: data.data.reference,
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
      }
    } catch (error) {
      console.error("[v0] Paystack initialization error:", error)
      throw error
    }
  },

  // Verify a payment transaction
  async verifyPayment(reference: string) {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured")
    }

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!data.status) {
        throw new Error(data.message || "Failed to verify payment")
      }

      return {
        success: true,
        status: data.data.status,
        amount: data.data.amount / 100, // Convert from kobo back to regular amount
        email: data.data.customer.email,
        reference: data.data.reference,
        paidAt: data.data.paid_at,
        metadata: data.data.metadata,
      }
    } catch (error) {
      console.error("[v0] Paystack verification error:", error)
      throw error
    }
  },

  // Verify webhook signature
  verifyWebhookSignature(body: any, signature: string): boolean {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecretKey) {
      console.error("[v0] PAYSTACK_SECRET_KEY is not configured")
      return false
    }

    const hash = crypto.createHmac("sha512", paystackSecretKey).update(JSON.stringify(body)).digest("hex")

    return hash === signature
  },

  // Create a transfer recipient (for withdrawals)
  async createTransferRecipient(account_number: string, bank_code: string, name: string) {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured")
    }

    try {
      const response = await fetch("https://api.paystack.co/transferrecipient", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "nuban",
          account_number,
          bank_code,
          name,
        }),
      })

      const data = await response.json()

      if (!data.status) {
        throw new Error(data.message || "Failed to create transfer recipient")
      }

      return {
        success: true,
        recipientCode: data.data.recipient_code,
        accountNumber: data.data.details.account_number,
        bankName: data.data.details.bank_name,
      }
    } catch (error) {
      console.error("[v0] Transfer recipient creation error:", error)
      throw error
    }
  },

  // Initiate a transfer (withdrawal)
  async initiateTransfer(amount: number, recipientCode: string, reason?: string) {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured")
    }

    try {
      const response = await fetch("https://api.paystack.co/transfer", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "balance",
          amount: amount * 100, // Convert to kobo
          recipient: recipientCode,
          reason: reason || "Withdrawal",
        }),
      })

      const data = await response.json()

      if (!data.status) {
        throw new Error(data.message || "Failed to initiate transfer")
      }

      return {
        success: true,
        transferCode: data.data.transfer_code,
        reference: data.data.reference,
        status: data.data.status,
      }
    } catch (error) {
      console.error("[v0] Transfer initiation error:", error)
      throw error
    }
  },

  // Get transfer details
  async getTransferDetails(reference: string) {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured")
    }

    try {
      const response = await fetch(`https://api.paystack.co/transfer/verify/${reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!data.status) {
        throw new Error(data.message || "Failed to get transfer details")
      }

      return {
        success: true,
        status: data.data.status,
        amount: data.data.amount / 100,
        reference: data.data.reference,
        transferCode: data.data.transfer_code,
      }
    } catch (error) {
      console.error("[v0] Get transfer details error:", error)
      throw error
    }
  },
}
