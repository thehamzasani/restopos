// src/app/(dashboard)/settings/users/page.tsx

import { UserManagement } from "@/components/settings/UserManagement"
import { Card, CardContent } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function UsersPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Only ADMIN can access user management
  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <UserManagement />
        </CardContent>
      </Card>
    </div>
  )
}