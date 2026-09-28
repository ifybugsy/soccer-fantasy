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

    // Route handlers perform cryptographic verification. The proxy only handles
    // navigation when the browser has no admin session cookie at all.
    // Invalid cookies are rejected by the server-side admin guard.

  }

  if (pathname.startsWith("/api/v1/admin")) {
    const authHeader = request.headers.get("authorization")
    const cookieToken = request.cookies.get("admin_token")?.value

    if (!authHeader?.startsWith("Bearer ") && !cookieToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Individual route handlers perform cryptographic verification and role checks.

  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/v1/admin/:path*"],
}
