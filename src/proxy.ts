import { NextRequest, NextResponse } from "next/server"

const PROTECTED = ["/dashboard"]
const LOGIN_PATH = "/login"
const COOKIE_NAME = "vb_session"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const session = request.cookies.get(COOKIE_NAME)
  if (session?.value === process.env.DASHBOARD_PASSWORD) {
    return NextResponse.next()
  }

  const loginUrl = new URL(LOGIN_PATH, request.url)
  loginUrl.searchParams.set("from", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
