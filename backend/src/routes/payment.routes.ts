import { Router, type Response } from "express"
import { PaystackService } from "../services/paystack.service"
import { TransactionService } from "../services/transaction.service"
import { WalletService } from "../services/wallet.service"
import { authMiddleware, type AuthRequest } from "../middleware/auth"
import { v4 as uuidv4 } from "uuid"

const router = Router()
const paystackService = new PaystackService()
const transactionService = new TransactionService()
const walletService = new WalletService()

router.post("/initialize", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body

    if (!amount || amount <= 0) {
      res.status(400).json({ error: "Valid amount is required" })
      return
    }

    const reference = `TXN-${req.userId}-${uuidv4()}`

    // Create pending transaction
    await transactionService.createTransaction(
      req.userId!,
      "deposit",
      amount,
      "paystack",
      reference,
      `Deposit of ₦${amount}`,
    )

    // Initialize Paystack payment
    const paystackResponse = await paystackService.initializePayment(req.userEmail!, amount, reference)

    console.log("[v0] Payment initialized:", reference)

    res.status(200).json({
      success: true,
      data: paystackResponse.data,
      reference,
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.post("/verify", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { reference } = req.body

    if (!reference) {
      res.status(400).json({ error: "Reference is required" })
      return
    }

    // Verify with Paystack
    const paystackResponse = await paystackService.verifyPayment(reference)

    if (paystackResponse.data.status === "success") {
      // Update transaction status
      await transactionService.updateTransactionStatus(reference, "completed")

      // Update wallet balance
      const amount = paystackResponse.data.amount / 100
      await walletService.updateBalance(req.userId!, amount, "add")

      console.log("[v0] Payment verified and wallet updated:", reference)

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: paystackResponse.data,
      })
    } else {
      res.status(400).json({ error: "Payment verification failed" })
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.post("/webhook", async (req: AuthRequest, res: Response) => {
  try {
    const signature = req.headers["x-paystack-signature"] as string
    const body = req.body

    // Verify signature
    if (!paystackService.verifySignature(signature, body)) {
      res.status(403).json({ error: "Invalid signature" })
      return
    }

    const { event, data } = body

    if (event === "charge.success") {
      const reference = data.reference
      const amount = data.amount / 100

      // Extract userId from reference
      const userId = reference.split("-")[1]

      // Update transaction
      await transactionService.updateTransactionStatus(reference, "completed")

      // Update wallet
      await walletService.updateBalance(userId, amount, "add")

      console.log("[v0] Webhook processed - Payment successful:", reference)
    }

    res.status(200).json({ success: true })
  } catch (error: any) {
    console.error("[v0] Webhook error:", error.message)
    res.status(400).json({ error: error.message })
  }
})

router.get("/transactions", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await transactionService.getUserTransactions(req.userId!)

    res.status(200).json({
      success: true,
      data: transactions,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/wallet", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const balance = await walletService.getBalance(req.userId!)

    res.status(200).json({
      success: true,
      balance,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
