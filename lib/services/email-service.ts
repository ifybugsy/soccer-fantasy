import { apiClient } from "@/lib/services/api-client"

export interface EmailVerificationRequest {
  email: string
  action: "send" | "verify"
  code?: string
}

export interface EmailVerificationResponse {
  success: boolean
  message: string
}

export class EmailService {
  async sendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.post<EmailVerificationResponse>("/v1/auth/verify-email-brevo", {
        action: "send",
        email,
      })

      if (!response.success) {
        return {
          success: false,
          error: response.error || "Failed to send verification email",
        }
      }

      console.log("[v0] Verification email sent successfully")
      return { success: true }
    } catch (error) {
      console.error("[v0] Email service error:", error)
      return {
        success: false,
        error: "Email service unavailable",
      }
    }
  }

  async verifyEmail(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.post<EmailVerificationResponse>("/v1/auth/verify-email-brevo", {
        action: "verify",
        email,
        code,
      })

      if (!response.success) {
        return {
          success: false,
          error: response.error || "Verification failed",
        }
      }

      console.log("[v0] Email verified successfully")
      return { success: true }
    } catch (error) {
      console.error("[v0] Email verification error:", error)
      return {
        success: false,
        error: "Verification service unavailable",
      }
    }
  }

  async resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    return this.sendVerificationEmail(email)
  }
}

export const emailService = new EmailService()
