"use client"
// src/components/pos/CheckoutModal.tsx

import { useState } from "react"
import { useCart } from "@/context/CartContext"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  UtensilsCrossed,
  Package,
  Bike,
  CreditCard,
  Banknote,
  Smartphone,
  MoreHorizontal,
  Loader2,
  CheckCircle2,
  MapPin,
  Tag,
  Truck,
} from "lucide-react"
import { toast } from "sonner"

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const PAYMENT_METHODS = [
  {
    value: "CASH",
    label: "Cash",
    icon: Banknote,
    selectedClass: "bg-green-50 border-green-400 text-green-700",
  },
  {
    value: "CARD",
    label: "Card",
    icon: CreditCard,
    selectedClass: "bg-blue-50 border-blue-400 text-blue-700",
  },
  {
    value: "UPI",
    label: "UPI",
    icon: Smartphone,
    selectedClass: "bg-purple-50 border-purple-400 text-purple-700",
  },
  {
    value: "OTHER",
    label: "Other",
    icon: MoreHorizontal,
    selectedClass: "bg-gray-50 border-gray-400 text-gray-700",
  },
] as const

// ─── Order type summary block ─────────────────────────────────────────────────

function OrderTypeInfo() {
  const { cart } = useCart()
  const setup = cart.orderSetup
  if (!setup) return null

  if (setup.orderType === "DINE_IN") {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
        <UtensilsCrossed className="h-4 w-4 text-blue-600" />
        <div>
          <p className="text-xs text-blue-600 font-medium">DINE-IN</p>
          <p className="text-sm font-semibold">{setup.tableName}</p>
        </div>
      </div>
    )
  }

  if (setup.orderType === "TAKEAWAY") {
    return (
      <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
        <Package className="h-4 w-4 text-orange-600" />
        <div>
          <p className="text-xs text-orange-600 font-medium">TAKEAWAY</p>
          <p className="text-sm font-semibold">{setup.customerName ?? "Walk-in"}</p>
          {setup.customerPhone && (
            <p className="text-xs text-gray-500">{setup.customerPhone}</p>
          )}
        </div>
      </div>
    )
  }

  // DELIVERY
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
        <Bike className="h-4 w-4 text-green-600" />
        <div>
          <p className="text-xs text-green-600 font-medium">DELIVERY</p>
          <p className="text-sm font-semibold">{setup.customerName ?? "Delivery Order"}</p>
          {setup.customerPhone && (
            <p className="text-xs text-gray-500">{setup.customerPhone}</p>
          )}
        </div>
      </div>
      {setup.deliveryAddress && (
        <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
          <MapPin className="h-3 w-3 mt-0.5 text-gray-400 shrink-0" />
          <span>{setup.deliveryAddress}</span>
        </div>
      )}
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function CheckoutModal({ open, onClose, onSuccess }: CheckoutModalProps) {
  const { cart, clearCart } = useCart()
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const setup = cart.orderSetup

  const handlePlaceOrder = async () => {
    if (!selectedPayment) {
      toast.error("Please select a payment method")
      return
    }
    if (!setup) {
      toast.error("Order setup is missing")
      return
    }

    setLoading(true)
    try {
      const body: Record<string, unknown> = {
        orderType: setup.orderType,
        items: cart.items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
        })),
        discount: cart.discount,
        paymentMethod: selectedPayment,
      }

      if (setup.orderType === "DINE_IN") {
        body.tableId = setup.tableId
      } else if (setup.orderType === "TAKEAWAY") {
        body.customerName = setup.customerName
        body.customerPhone = setup.customerPhone
      } else if (setup.orderType === "DELIVERY") {
        body.customerName = setup.customerName
        body.customerPhone = setup.customerPhone
        body.deliveryAddress = setup.deliveryAddress
        body.deliveryNote = setup.deliveryNote
        body.deliveryFee = cart.deliveryFee
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Failed to create order")
      }

      setCompleted(true)
      clearCart()

      setTimeout(() => {
        toast.success(`Order #${data.data.orderNumber} placed!`)
        onSuccess()
        setCompleted(false)
        setSelectedPayment(null)
      }, 1400)
    } catch (error: any) {
      toast.error(error.message ?? "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // Success state
  if (completed) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Order Placed!</h3>
            <p className="text-sm text-gray-500 text-center">
              Your order has been sent to the kitchen.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Order</DialogTitle>
          <DialogDescription>Review your order and select a payment method</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Order type info (reads from context) */}
          <OrderTypeInfo />

          {/* Items list */}
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-700">Order Items</p>
            <div className="space-y-1 max-h-40 overflow-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-0.5">
                  <span className="text-gray-700">
                    <span className="font-medium">{item.quantity}×</span> {item.name}
                    {item.notes && (
                      <span className="text-xs text-gray-400 ml-1">({item.notes})</span>
                    )}
                  </span>
                  <span className="text-gray-900 font-medium shrink-0 ml-2">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price breakdown */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-sm text-purple-600">
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Discount
                </span>
                <span>-${cart.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax</span>
              <span>${cart.tax.toFixed(2)}</span>
            </div>
            {setup?.orderType === "DELIVERY" && (
              <div className="flex justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3" /> Delivery Fee
                </span>
                <span>${cart.deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-blue-600">${cart.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">Payment Method</p>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map(({ value, label, icon: Icon, selectedClass }) => (
                <button
                  key={value}
                  type="button"
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                    selectedPayment === value
                      ? selectedClass
                      : "bg-white border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                  onClick={() => setSelectedPayment(value)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handlePlaceOrder}
              disabled={loading || !selectedPayment}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Placing...
                </>
              ) : (
                `Place Order — $${cart.total.toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}