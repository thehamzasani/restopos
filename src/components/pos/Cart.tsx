"use client"
// src/components/pos/Cart.tsx

import { useState } from "react"
import { useCart } from "@/context/CartContext"
import { OrderSetup } from "@/types"
import { CartItem } from "./CartItem"
import { CheckoutModal } from "./CheckoutModal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  ShoppingCart,
  UtensilsCrossed,
  Package,
  Bike,
  ArrowLeft,
  Tag,
  X,
  Percent,
  DollarSign,
  Truck,
  MapPin,
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface CartProps {
  orderSetup: OrderSetup
  onBack: () => void
  onOrderComplete: () => void
}

// ─── Order type header ────────────────────────────────────────────────────────

function OrderTypeHeader({ setup }: { setup: OrderSetup }) {
  if (setup.orderType === "DINE_IN") {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <UtensilsCrossed className="h-4 w-4 text-blue-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-blue-700">DINE-IN</p>
          <p className="text-sm font-bold text-blue-900 truncate">{setup.tableName}</p>
        </div>
      </div>
    )
  }

  if (setup.orderType === "TAKEAWAY") {
    return (
      <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
        <Package className="h-4 w-4 text-orange-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-orange-700">TAKEAWAY</p>
          <p className="text-sm font-bold text-orange-900 truncate">
            {setup.customerName ?? "Walk-in Customer"}
          </p>
          {setup.customerPhone && (
            <p className="text-xs text-orange-600">{setup.customerPhone}</p>
          )}
        </div>
      </div>
    )
  }

  // DELIVERY
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
        <Bike className="h-4 w-4 text-green-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-green-700">DELIVERY</p>
          <p className="text-sm font-bold text-green-900 truncate">
            {setup.customerName ?? "Delivery Order"}
          </p>
          {setup.customerPhone && (
            <p className="text-xs text-green-600">{setup.customerPhone}</p>
          )}
        </div>
      </div>
      {setup.deliveryAddress && (
        <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
          <MapPin className="h-3 w-3 mt-0.5 text-gray-400 shrink-0" />
          <span className="break-words">{setup.deliveryAddress}</span>
        </div>
      )}
    </div>
  )
}

// ─── Discount popover ─────────────────────────────────────────────────────────

function DiscountPopover() {
  const { cart, applyDiscount, applyDiscountPercent, clearDiscount } = useCart()
  const [mode, setMode] = useState<"AMOUNT" | "PERCENT">("AMOUNT")
  const [value, setValue] = useState("")
  const [open, setOpen] = useState(false)

  const hasDiscount = cart.discount > 0

  const handleApply = () => {
    const num = parseFloat(value)
    if (isNaN(num) || num < 0) return
    if (mode === "AMOUNT") {
      applyDiscount(num)
    } else {
      applyDiscountPercent(num)
    }
    setOpen(false)
    setValue("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasDiscount ? "default" : "outline"}
          size="sm"
          className={`h-8 text-xs gap-1 ${
            hasDiscount ? "bg-purple-600 hover:bg-purple-700 text-white" : ""
          }`}
        >
          <Tag className="h-3 w-3" />
          {hasDiscount ? `Discount: -$${cart.discount.toFixed(2)}` : "Add Discount"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Apply Discount</p>
            {hasDiscount && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-red-500 hover:text-red-700 px-2"
                onClick={() => {
                  clearDiscount()
                  setOpen(false)
                }}
              >
                <X className="h-3 w-3 mr-1" /> Remove
              </Button>
            )}
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-md overflow-hidden border">
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
                mode === "AMOUNT"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setMode("AMOUNT")}
            >
              <DollarSign className="h-3 w-3" /> Amount
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
                mode === "PERCENT"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setMode("PERCENT")}
            >
              <Percent className="h-3 w-3" /> Percent
            </button>
          </div>

          {/* Quick presets for percent mode */}
          {mode === "PERCENT" && (
            <div className="flex gap-1.5">
              {[5, 10, 15, 20].map((p) => (
                <button
                  key={p}
                  type="button"
                  className="flex-1 py-1 text-xs border rounded hover:bg-gray-50 font-medium"
                  onClick={() => {
                    applyDiscountPercent(p)
                    setOpen(false)
                  }}
                >
                  {p}%
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {mode === "AMOUNT" ? "$" : "%"}
              </span>
              <Input
                type="number"
                min="0"
                step="0.01"
                max={mode === "PERCENT" ? 100 : undefined}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="pl-6 h-8 text-sm"
                placeholder={mode === "AMOUNT" ? "0.00" : "0"}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
              />
            </div>
            <Button size="sm" className="h-8 px-3" onClick={handleApply}>
              Apply
            </Button>
          </div>

          {value && mode === "PERCENT" && !isNaN(parseFloat(value)) && (
            <p className="text-xs text-gray-500 text-center">
              ≈ -${((cart.subtotal * parseFloat(value)) / 100).toFixed(2)} off
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Main Cart component ──────────────────────────────────────────────────────

export function Cart({ orderSetup, onBack, onOrderComplete }: CartProps) {
  const { cart, updateQuantity, updateItemNotes, removeItem } = useCart()
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const isEmpty = cart.items.length === 0
  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">Cart</h2>
            {itemCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <OrderTypeHeader setup={orderSetup} />
      </div>

      {/* Items */}
      <div className="flex-1 overflow-auto p-3 space-y-1">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
            <ShoppingCart className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">Cart is empty</p>
            <p className="text-xs text-gray-400 mt-1">Add items from the menu</p>
          </div>
        ) : (
          cart.items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onUpdateNotes={updateItemNotes}
              onRemove={removeItem}
            />
          ))
        )}
      </div>

      {/* Footer - totals + checkout */}
      {!isEmpty && (
        <div className="border-t p-4 space-y-3">
          {/* Discount button */}
          <div className="flex justify-end">
            <DiscountPopover />
          </div>

          <Separator />

          {/* Price breakdown */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>

            {cart.discount > 0 && (
              <div className="flex justify-between text-purple-600">
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Discount
                </span>
                <span>-${cart.discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>${cart.tax.toFixed(2)}</span>
            </div>

            {orderSetup.orderType === "DELIVERY" && (
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3" /> Delivery Fee
                </span>
                <span>${cart.deliveryFee.toFixed(2)}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total</span>
            <span className="text-blue-600">${cart.total.toFixed(2)}</span>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={() => setCheckoutOpen(true)}
          >
            Checkout — ${cart.total.toFixed(2)}
          </Button>
        </div>
      )}

      {/* Checkout modal — reads orderSetup from cart context, no prop needed */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => {
          setCheckoutOpen(false)
          onOrderComplete()
        }}
      />
    </div>
  )
}