// src/app/(dashboard)/settings/tax/page.tsx

import { prisma } from "@/lib/prisma"
import { TaxSettings } from "@/components/settings/TaxSettings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

async function getTaxRate() {
  let settings = await prisma.settings.findFirst({
    select: { taxRate: true },
  })

  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        restaurantName: "My Restaurant",
        taxRate: 10,
        currency: "USD",
      },
      select: { taxRate: true },
    })
  }

  return Number(settings.taxRate)
}

export default async function TaxSettingsPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Only ADMIN and MANAGER can access tax settings
  if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
    redirect("/")
  }

  const taxRate = await getTaxRate()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tax Settings</h1>
        <p className="text-muted-foreground">
          Configure tax rate for orders
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax Configuration</CardTitle>
          <CardDescription>
            Set the tax percentage that will be applied to all orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TaxSettings initialTaxRate={taxRate} />
        </CardContent>
      </Card>
    </div>
  )
}