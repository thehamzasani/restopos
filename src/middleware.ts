import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const session = req.auth
  const path = req.nextUrl.pathname

  // Check if user is authenticated
  if (!session && path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Redirect authenticated users away from login
  if (session && path === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Role-based access control
  if (session?.user) {
    if (path.startsWith("/dashboard/settings/users") && session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (
      path.startsWith("/dashboard/reports") &&
      !["ADMIN", "MANAGER"].includes(session.user.role || "")
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (
      path.startsWith("/dashboard/kitchen") &&
      session.user.role !== "KITCHEN" &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}