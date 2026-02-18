"use client"

import { MenuItem } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock } from "lucide-react"
import Image from "next/image"

interface MenuItemCardProps {
  item: MenuItem
  onAddToCart: (item: MenuItem) => void
}

export function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-lg ${
        !item.isAvailable ? "opacity-60" : "cursor-pointer"
      }`}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        
        {/* Availability Badge */}
        {!item.isAvailable && (
          <div className="absolute top-2 right-2">
            <Badge variant="destructive">Unavailable</Badge>
          </div>
        )}

        {/* Preparation Time */}
        {item.preparationTime && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="bg-white/90">
              <Clock className="h-3 w-3 mr-1" />
              {item.preparationTime} min
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Item Name */}
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
          {item.name}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Price and Add Button */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            Rs {Number(item.price).toFixed(2)}
          </span>

          <Button
            size="sm"
            onClick={() => onAddToCart(item)}
            disabled={!item.isAvailable}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}