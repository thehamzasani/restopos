import { redirect } from "next/navigation"

export default async function HomePage() {
  const { auth } = await import("@/lib/auth")
  const session = await auth()

  if (session) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}