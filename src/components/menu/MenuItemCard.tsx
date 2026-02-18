// src/components/menu/MenuItemCard.tsx

"use client"

import { useState } from "react"
import { MenuItem } from "@/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChefHat,
  UtensilsCrossed,  // ✅ Beautiful food icon
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { IngredientManager } from "./IngredientManager"

interface MenuItemCardProps {
  item: MenuItem
  onEdit: (item: MenuItem) => void
  onDelete: (id: string) => void
  onRefresh?: () => void
}

export function MenuItemCard({
  item,
  onEdit,
  onDelete,
  onRefresh,
}: MenuItemCardProps) {
  const [toggling, setToggling] = useState(false)
  const [showIngredients, setShowIngredients] = useState(false)

  const toggleAvailability = async () => {
    setToggling(true)
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          isAvailable: !item.isAvailable,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success(
          `${item.name} is now ${!item.isAvailable ? "available" : "unavailable"}`
        )
        onRefresh?.()
      } else {
        toast.error(data.error || "Failed to update item")
      }
    } catch (error) {
      toast.error("Failed to update item")
    } finally {
      setToggling(false)
    }
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow overflow-hidden">
        {/* Image Section - Smaller */}
        <div className="relative w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-100">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
            />
          ) : (
            // ✅ Beautiful icon when no image
            <div className="flex items-center justify-center h-full">
              <UtensilsCrossed className="h-12 w-12 text-blue-400" strokeWidth={1.5} />
            </div>
          )}
          
          {/* Availability Badge on Image */}
          <div className="absolute top-2 right-2">
            <Badge 
              variant={item.isAvailable ? "default" : "secondary"}
              className="text-xs"
            >
              {item.isAvailable ? "Available" : "Unavailable"}
            </Badge>
          </div>
        </div>

        {/* Content Section - Compact */}
        <CardContent className="p-3">
          <div className="space-y-2">
            {/* Title & Menu */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">{item.name}</h3>
                <Badge variant="outline" className="mt-1 text-xs">
                  {item.category.name}
                </Badge>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowIngredients(true)}>
                    <ChefHat className="mr-2 h-4 w-4" />
                    Manage Ingredients
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={toggleAvailability}
                    disabled={toggling}
                  >
                    {item.isAvailable ? (
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(item.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Description - 2 lines max */}
            {item.description && (
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              {/* Ingredients count */}
              {item._count?.ingredients && item._count.ingredients > 0 ? (
                <div className="flex items-center gap-1">
                  <ChefHat className="h-3 w-3" />
                  <span>{item._count.ingredients} ingredients</span>
                </div>
              ) : (
                <div />
              )}

              {/* Prep time */}
              {item.preparationTime && (
                <span>⏱️ {item.preparationTime} min</span>
              )}
            </div>
          </div>
        </CardContent>

        {/* Footer - Price */}
        <CardFooter className="p-3 pt-0">
          <div className="w-full flex items-center justify-between">
            <p className="text-xl font-bold text-blue-600">
              Rs {Number(item.price).toFixed(2)}
            </p>
          </div>
        </CardFooter>
      </Card>

      <IngredientManager
        menuItemId={item.id}
        menuItemName={item.name}
        open={showIngredients}
        onOpenChange={setShowIngredients}
        onUpdate={onRefresh}
      />
    </>
  )
}