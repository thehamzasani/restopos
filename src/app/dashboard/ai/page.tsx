import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import ChatPanel from "@/components/ai/ChatPanel"

export default async function AIPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const role = session.user.role
  if (role !== "ADMIN" && role !== "MANAGER") redirect("/dashboard")

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
        <p className="text-sm text-gray-500">
          Ask about sales, menu performance, inventory, or get business suggestions
        </p>
      </div>
      <ChatPanel />
    </div>
  )
}
