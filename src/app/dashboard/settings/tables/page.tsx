// src/app/(dashboard)/settings/tables/page.tsx

import { TableManagement } from "@/components/settings/TableManagement"
import { Card, CardContent } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function TablesPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Only ADMIN can access table management
  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <TableManagement />
        </CardContent>
      </Card>
    </div>
  )
}