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
  // ✅ NEW: Import icon
  ChefHat,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
// ✅ NEW: Import IngredientManager
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
  const router = useRouter()
  // const { toast } = useToast()
  const [toggling, setToggling] = useState(false)
  // ✅ NEW: State for ingredient manager
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
        
        toast.success(`${item.name} is now ${!item.isAvailable ? "available" : "unavailable"}`)
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
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          {/* Image */}
          <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Image
              </div>
            )}
          </div>

          {/* Title & Category */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {/* ✅ NEW: Manage Ingredients option */}
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

            <Badge variant="outline">{item.category.name}</Badge>

            {item.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {item.description}
              </p>
            )}

            {/* ✅ NEW: Show ingredient count if any */}
            {item._count?.ingredients && item._count.ingredients > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <ChefHat className="h-3 w-3" />
                <span>{item._count.ingredients} ingredients linked</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              ${Number(item.price).toFixed(2)}
            </p>
            {item.preparationTime && (
              <p className="text-xs text-gray-500">
                {item.preparationTime} min prep
              </p>
            )}
          </div>

          <Badge variant={item.isAvailable ? "default" : "secondary"}>
            {item.isAvailable ? "Available" : "Unavailable"}
          </Badge>
        </CardFooter>
      </Card>

      {/* ✅ NEW: Ingredient Manager Dialog */}
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