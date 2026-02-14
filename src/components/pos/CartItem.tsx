"use client"

import { CartItem as CartItemType } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Minus, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (id: string, quantity: number) => void
  onUpdateNotes: (id: string, notes: string) => void
  onRemove: (id: string) => void
}

export function CartItem({
  item,
  onUpdateQuantity,
  onUpdateNotes,
  onRemove,
}: CartItemProps) {
  const [showNotes, setShowNotes] = useState(false)

  return (
    <div className="flex gap-3 pb-4 border-b">
      {/* Image */}
      <div className="relative h-16 w-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-2xl">🍽️</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        {/* Name and Remove */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Price */}
        <p className="text-sm text-gray-600 mb-2">
          ${Number(item.price).toFixed(2)} each
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium w-8 text-center">
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <span className="ml-auto font-semibold">
            ${(Number(item.price) * item.quantity).toFixed(2)}
          </span>
        </div>

        {/* Notes */}
        <div>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={() => setShowNotes(!showNotes)}
          >
            {showNotes ? "Hide notes" : "Add notes"}
          </Button>
          {showNotes && (
            <Textarea
              placeholder="Special instructions..."
              value={item.notes || ""}
              onChange={(e) => onUpdateNotes(item.id, e.target.value)}
              className="mt-2 text-sm"
              rows={2}
            />
          )}
        </div>
      </div>
    </div>
  )
}