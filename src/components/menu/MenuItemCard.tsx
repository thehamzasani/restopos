"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface MenuItemCardProps {
  menuItem: {
    id: string
    name: string
    description: string | null
    price: number
    image: string | null
    isAvailable: boolean
    preparationTime: number | null
    category: {
      id: string
      name: string
    }
  }
  onEdit: (menuItem: any) => void
  onDelete: (id: string) => void
  onToggleAvailable: (id: string, isAvailable: boolean) => void
}

export default function MenuItemCard({
  menuItem,
  onEdit,
  onDelete,
  onToggleAvailable,
}: MenuItemCardProps) {
  return (
    <Card className={!menuItem.isAvailable ? "opacity-60" : ""}>
      <CardContent className="p-0">
        {/* Image */}
        {menuItem.image ? (
          <div className="h-48 w-full overflow-hidden rounded-t-lg bg-gray-100">
            <img
              src={menuItem.image}
              alt={menuItem.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-t-lg bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-4xl text-gray-400">🍽️</span>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="text-lg font-semibold">{menuItem.name}</h3>
                {!menuItem.isAvailable && (
                  <Badge variant="secondary">Unavailable</Badge>
                )}
              </div>
              <p className="mb-2 text-sm text-gray-500 line-clamp-2">
                {menuItem.description || "No description"}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(menuItem)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    onToggleAvailable(menuItem.id, !menuItem.isAvailable)
                  }
                >
                  {menuItem.isAvailable ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Mark Unavailable
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Mark Available
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(menuItem.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Category</span>
              <Badge variant="outline" className="mt-1 w-fit">
                {menuItem.category.name}
              </Badge>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500">Price</span>
              <span className="mt-1 text-xl font-bold text-blue-600">
                {formatCurrency(Number(menuItem.price))}
              </span>
            </div>
          </div>

          {menuItem.preparationTime && (
            <div className="mt-2 text-xs text-gray-500">
              ⏱️ Prep time: {menuItem.preparationTime} min
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}