"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  PackageOpen,
  ChefHat,
  BarChart3,
  Settings,
  Users,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "MANAGER", "CASHIER"],
  },
  {
    name: "POS",
    href: "/dashboard/pos",
    icon: ShoppingCart,
    roles: ["ADMIN", "MANAGER", "CASHIER"],
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
    icon: UtensilsCrossed,
    roles: ["ADMIN", "MANAGER", "CASHIER"],
  },
  {
    name: "Menu",
    href: "/dashboard/menu",
    icon: UtensilsCrossed,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    name: "Categories",
    href: "/dashboard/menu/categories",
    icon: PackageOpen,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    name: "Inventory",
    href: "/dashboard/inventory",
    icon: PackageOpen,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    name: "Kitchen",
    href: "/dashboard/kitchen",
    icon: ChefHat,
    roles: ["ADMIN", "KITCHEN"],
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role

  const allowedNavigation = navigation.filter((item) =>
    item.roles.includes(userRole || "")
  )

  return (
    <aside className="w-64 border-r bg-gray-50 px-4 py-6">
      <nav className="space-y-1">
        {allowedNavigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}