"use client"
// src/components/pos/CartItem.tsx

import { useState } from "react"
import { CartItem as CartItemType } from "@/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Minus, Plus, Trash2 } from "lucide-react"
import Image from "next/image"

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
    <div className="flex gap-3 pb-3 border-b last:border-0">
      {/* Thumbnail */}
      <div className="relative h-14 w-14 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-xl">🍽️</div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        {/* Name + Remove */}
        <div className="flex items-start justify-between gap-1 mb-1">
          <h4 className="font-medium text-sm leading-tight line-clamp-2">{item.name}</h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Price per unit */}
        <p className="text-xs text-gray-500 mb-1.5">Rs {Number(item.price).toFixed(2)} each</p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <span className="ml-auto text-sm font-bold">
            Rs {(Number(item.price) * item.quantity).toFixed(2)}
          </span>
        </div>

        {/* Notes */}
        <div className="mt-1.5">
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-gray-400 hover:text-gray-600"
            onClick={() => setShowNotes(!showNotes)}
          >
            {showNotes ? "Hide notes" : item.notes ? "Edit notes" : "Add notes"}
          </Button>
          {item.notes && !showNotes && (
            <p className="text-xs text-amber-600 italic mt-0.5">"{item.notes}"</p>
          )}
          {showNotes && (
            <Textarea
              placeholder="Special instructions..."
              value={item.notes ?? ""}
              onChange={(e) => onUpdateNotes(item.id, e.target.value)}
              className="mt-1 text-xs"
              rows={2}
            />
          )}
        </div>
      </div>
    </div>
  )
}