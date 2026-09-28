import { type NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_token")?.value

    if (!token) {
      if (pathname === "/admin/login") {
        return NextResponse.next()
      }
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // Verify JWT format (three parts separated by dots)
    if (!token.includes(".") || token.split(".").length !== 3) {
      if (pathname === "/admin/login") {
        return NextResponse.next()
      }
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  if (pathname.startsWith("/api/v1/admin")) {
    const authHeader = request.headers.get("authorization")
    const cookieToken = request.cookies.get("admin_token")?.value

    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : cookieToken

    if (!token || !token.includes(".") || token.split(".").length !== 3) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/v1/admin/:path*"],
}
