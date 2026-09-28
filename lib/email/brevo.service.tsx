import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class BrevoEmailService {
  private transporter: any

  constructor() {
    // Brevo SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
      port: Number.parseInt(process.env.BREVO_SMTP_PORT || "587"),
      secure: process.env.BREVO_SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.BREVO_SENDER_EMAIL,
        pass: process.env.BREVO_SMTP_KEY,
      },
    })
  }

  async sendVerificationEmail(email: string, code: string): Promise<boolean> {
    try {
      const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/verify-email?email=${encodeURIComponent(email)}&code=${code}`

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Soccer Fantasy</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Email Verification</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0;">Welcome to Soccer Fantasy!</h2>
            <p style="color: #666; line-height: 1.6;">Thank you for signing up. Please verify your email address by entering the code below:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #667eea;">
              <p style="font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px; margin: 0;">${code}</p>
            </div>
            <p style="color: #666; line-height: 1.6;">Or click the button below to verify:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${verificationLink}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Verify Email</a>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">This code will expire in 30 minutes. If you didn't sign up for Soccer Fantasy, please ignore this email.</p>
          </div>
        </div>
      `

      const result = await this.transporter.sendMail({
        from: process.env.BREVO_SENDER_EMAIL,
        to: email,
        subject: "Verify Your Email - Soccer Fantasy",
        html,
        text: `Your verification code is: ${code}`,
      })

      console.log("[v0] Email sent successfully:", result.messageId)
      return true
    } catch (error) {
      console.error("[v0] Brevo email error:", error)
      return false
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    try {
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Soccer Fantasy</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Password Reset</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #666; line-height: 1.6;">We received a request to reset your password. Click the button below to proceed:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${resetLink}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours. If you didn't request a password reset, please ignore this email.</p>
          </div>
        </div>
      `

      await this.transporter.sendMail({
        from: process.env.BREVO_SENDER_EMAIL,
        to: email,
        subject: "Reset Your Password - Soccer Fantasy",
        html,
        text: `Click here to reset your password: ${resetLink}`,
      })

      return true
    } catch (error) {
      console.error("[v0] Brevo password reset error:", error)
      return false
    }
  }

  async sendTransactionNotification(email: string, transactionData: any): Promise<boolean> {
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Soccer Fantasy</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Transaction Update</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0;">Transaction Confirmed</h2>
            <p style="color: #666; line-height: 1.6;">Your transaction has been processed successfully.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="margin: 10px 0;"><strong>Amount:</strong> ${transactionData.amount} ${transactionData.currency}</p>
              <p style="margin: 10px 0;"><strong>Type:</strong> ${transactionData.type}</p>
              <p style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">${transactionData.status}</span></p>
            </div>
          </div>
        </div>
      `

      await this.transporter.sendMail({
        from: process.env.BREVO_SENDER_EMAIL,
        to: email,
        subject: `Transaction ${transactionData.status} - Soccer Fantasy`,
        html,
      })

      return true
    } catch (error) {
      console.error("[v0] Brevo transaction notification error:", error)
      return false
    }
  }
}

export const brevoService = new BrevoEmailService()
