import { getAdminToken } from "@/lib/admin/admin-session"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiRequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  headers?: Record<string, string>
  body?: any
  timeout?: number
  requiresAuth?: boolean
  requiresAdminAuth?: boolean
}

class ApiClient {
  private baseUrl: string
  private defaultTimeout = 60000
  private maxRetries = 3

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "/api/v1") {
    this.baseUrl = baseUrl
  }

  private async executeRequest<T>(
    endpoint: string,
    config: ApiRequestConfig = {},
    retryCount = 0,
  ): Promise<ApiResponse<T>> {
    const {
      method = "GET",
      headers = {},
      body,
      timeout = this.defaultTimeout,
      requiresAuth = false,
      requiresAdminAuth = false,
    } = config

    const url = `${this.baseUrl}${endpoint}`
    const mergedHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    }

    // Add auth tokens if needed
    if (requiresAdminAuth) {
      const adminToken = getAdminToken()
      if (adminToken) {
        mergedHeaders["Authorization"] = `Bearer ${adminToken}`
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: mergedHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if ((response.status >= 500 || response.status === 408) && retryCount < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)))
          return this.executeRequest<T>(endpoint, config, retryCount + 1)
        }

        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        }
      }

      return {
        success: true,
        data,
        message: data.message,
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        if (retryCount < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)))
          return this.executeRequest<T>(endpoint, config, retryCount + 1)
        }
        return {
          success: false,
          error: "Request timeout - please try again",
        }
      }

      return {
        success: false,
        error: error.message || "Network error",
      }
    }
  }

  async get<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(endpoint, { ...config, method: "GET" })
  }

  async post<T>(endpoint: string, body?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(endpoint, { ...config, method: "POST", body })
  }

  async put<T>(endpoint: string, body?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(endpoint, { ...config, method: "PUT", body })
  }

  async delete<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(endpoint, { ...config, method: "DELETE" })
  }

  async patch<T>(endpoint: string, body?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(endpoint, { ...config, method: "PATCH", body })
  }
}

export const apiClient = new ApiClient()
