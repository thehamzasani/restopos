// src/app/(dashboard)/settings/page.tsx

import { prisma } from "@/lib/prisma"
import { RestaurantSettings } from "@/components/settings/RestaurantSettings"
import { ReceiptTemplate } from "@/components/settings/ReceiptTemplate"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"
import {
  Settings as SettingsIcon,
  Receipt,
  Percent,
  Users,
  UtensilsCrossed,
  Bike,        // ← ADD THIS
  ArrowRight
} from "lucide-react"

async function getSettings() {
  let settings = await prisma.settings.findFirst()

  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        restaurantName: "My Restaurant",
        taxRate: 10,
        currency: "USD",
        deliveryFee: 0,           // ← ADD THIS
        minOrderAmount: 0,        // ← ADD THIS
      },
    })
  }

  return settings
}

export default async function SettingsPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
    redirect("/")
  }

  const settings = await getSettings()
  const isAdmin = session.user.role === "ADMIN"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your restaurant settings and preferences
        </p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Tax Settings */}
        <Link href="/dashboard/settings/tax">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tax Settings
              </CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Number(settings.taxRate)}%</div>
              <p className="text-xs text-muted-foreground">
                Configure tax rate
              </p>
              <Button variant="ghost" size="sm" className="mt-2 w-full justify-between px-0">
                Manage Tax
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Delivery Settings Quick Card */}
        <Link href="/dashboard/settings/delivery">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Delivery Settings
              </CardTitle>
              <Bike className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs {Number(settings.deliveryFee).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Default delivery fee
              </p>
              <Button variant="ghost" size="sm" className="mt-2 w-full justify-between px-0">
                Manage Delivery
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* User Management - Admin Only */}
        {isAdmin && (
          <Link href="/dashboard/settings/users">
            <Card className="cursor-pointer transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage</div>
                <p className="text-xs text-muted-foreground">
                  Add and edit users
                </p>
                <Button variant="ghost" size="sm" className="mt-2 w-full justify-between px-0">
                  User Management
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Table Management - Admin Only */}
        {isAdmin && (
          <Link href="/dashboard/settings/tables">
            <Card className="cursor-pointer transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tables
                </CardTitle>
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage</div>
                <p className="text-xs text-muted-foreground">
                  Add and edit tables
                </p>
                <Button variant="ghost" size="sm" className="mt-2 w-full justify-between px-0">
                  Table Management
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* Main Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <SettingsIcon className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="receipt">
            <Receipt className="mr-2 h-4 w-4" />
            Receipt Template
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Information</CardTitle>
              <CardDescription>
                Update your restaurant's basic information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RestaurantSettings initialData={{
                ...settings,
                email: settings.email ?? undefined,
                phone: settings.phone ?? undefined,
                address: settings.address ?? undefined,
                receiptHeader: settings.receiptHeader ?? undefined,
                receiptFooter: settings.receiptFooter ?? undefined,
                taxRate: Number(settings.taxRate),            // ✅ add
                deliveryFee: Number(settings.deliveryFee),    // ✅ add
                minOrderAmount: Number(settings.minOrderAmount), // ✅ add
              }} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipt" className="space-y-4">
          <ReceiptTemplate
            settings={{
              restaurantName: settings.restaurantName,
              address: settings.address,
              phone: settings.phone,
              receiptHeader: settings.receiptHeader,
              receiptFooter: settings.receiptFooter,
              taxRate: Number(settings.taxRate),
              currency: settings.currency,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
