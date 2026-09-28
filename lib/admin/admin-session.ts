export function setAdminToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("admin_token", token)
  }
}

export function getAdminToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("admin_token")
  }
  return null
}

export function clearAdminToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_token")
  }
}

export function isAdminAuthenticated(): boolean {
  const token = getAdminToken()
  if (!token) return false

  try {
    // Parse JWT payload
    const parts = token.split(".")
    if (parts.length !== 3) return false

    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString())
    const now = Math.floor(Date.now() / 1000)

    return payload.exp > now
  } catch {
    return false
  }
}

export function getAdminInfo(): { userId: string; role: string } | null {
  const token = getAdminToken()
  if (!token) return null

  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString())
    return {
      userId: payload.userId,
      role: payload.role,
    }
  } catch {
    return null
  }
}
