"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  PackageOpen,
  ChefHat,
  BarChart3,
  Settings,
  Users,
  Percent,
  ChevronDown,
  ChevronRight,
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
    roles: ["ADMIN", "MANAGER"],
    submenu: [
      {
        name: "General",
        href: "/dashboard/settings",
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: "Tax Settings",
        href: "/dashboard/settings/tax",
        icon: Percent,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: "Users",
        href: "/dashboard/settings/users",
        icon: Users,
        roles: ["ADMIN"],
      },
      {
        name: "Tables",
        href: "/dashboard/settings/tables",
        icon: UtensilsCrossed,
        roles: ["ADMIN"],
      },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role
  const [openMenus, setOpenMenus] = useState<string[]>(["Settings"]) // Settings open by default

  const allowedNavigation = navigation.filter((item) =>
    item.roles.includes(userRole || "")
  )

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((name) => name !== menuName)
        : [...prev, menuName]
    )
  }

  // Check if any submenu item is active
  const isSubmenuActive = (submenu: any[]) => {
    return submenu.some((item) => pathname === item.href)
  }

  return (
    <aside className="w-64 border-r bg-gray-50 px-4 py-6">
      <nav className="space-y-1">
        {allowedNavigation.map((item) => {
          const Icon = item.icon
          const hasSubmenu = item.submenu && item.submenu.length > 0
          const isMenuOpen = openMenus.includes(item.name)
          const isActive = pathname === item.href
          const hasActiveSubmenu = hasSubmenu && isSubmenuActive(item.submenu)

          // Filter submenu based on user role
          const allowedSubmenu = hasSubmenu
            ? item.submenu.filter((subItem: any) =>
                subItem.roles.includes(userRole || "")
              )
            : []

          return (
            <div key={item.name}>
              {hasSubmenu ? (
                <>
                  {/* Menu with submenu - clickable to expand/collapse */}
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive || hasActiveSubmenu
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </div>
                    {isMenuOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {/* Submenu items */}
                  {isMenuOpen && allowedSubmenu.length > 0 && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                      {allowedSubmenu.map((subItem: any) => {
                        const SubIcon = subItem.icon
                        const isSubActive = pathname === subItem.href

                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              isSubActive
                                ? "bg-blue-100 text-blue-700 font-medium"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                          >
                            {SubIcon && <SubIcon className="h-4 w-4" />}
                            {subItem.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                // Regular menu item without submenu
                <Link
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
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}