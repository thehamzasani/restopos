"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/useCart"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Loader2, CreditCard, Banknote, Smartphone, DollarSign } from "lucide-react"
import { Receipt } from "./Receipt" // ✅ NEW IMPORT

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
}

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { cart, clearCart } = useCart()
  const router = useRouter()

  const [paymentMethod, setPaymentMethod] = useState<string>("CASH")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // ✅ NEW: Receipt state
  const [showReceipt, setShowReceipt] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!cart.orderSetup) {
      toast.error("Order setup is missing")
      return
    }

    try {
      setIsSubmitting(true)

      const orderData = {
        orderType: cart.orderSetup.orderType,
        tableId: cart.orderSetup.tableId,
        customerName: cart.orderSetup.customerName,
        customerPhone: cart.orderSetup.customerPhone,
        items: cart.items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
        })),
        notes,
        discount: 0,
        paymentMethod,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to create order")
      }

      // ✅ UPDATED: Show different message based on whether order was created or updated
      if (data.isUpdated) {
        toast.success("Items added!", {
          description: data.message,
        })
      } else {
        toast.success("Order created!", {
          description: `Order #${data.data.orderNumber} has been created successfully`,
        })
      }

      // ✅ NEW: Save order ID and show receipt
      setCreatedOrderId(data.data.id)
      setShowReceipt(true)

      clearCart()
      onClose()
      
      // ✅ OPTIONAL: Navigate to orders page after a short delay
      setTimeout(() => {
        router.push("/dashboard/orders")
      }, 500)
    } catch (error: any) {
      console.error("Error creating order:", error)
      toast.error(error.message || "Failed to create order")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Review your order and select payment method
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Order Summary */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Order Summary</h4>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items</span>
                  <span className="font-medium">{cart.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${cart.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-primary">${cart.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="CASH" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Banknote className="h-4 w-4 text-green-600" />
                    <span>Cash</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="CARD" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span>Card</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="UPI" id="upi" />
                  <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Smartphone className="h-4 w-4 text-purple-600" />
                    <span>UPI</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="OTHER" id="other" />
                  <Label htmlFor="other" className="flex items-center gap-2 cursor-pointer flex-1">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                    <span>Other</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Order Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Order"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ NEW: Receipt Modal */}
      {createdOrderId && (
        <Receipt 
          orderId={createdOrderId}
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  )
}