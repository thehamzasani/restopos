"use client"

import { useCart } from "@/hooks/useCart"
import { CartItem } from "./CartItem"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, UtensilsCrossed, Package } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { CheckoutModal } from "./CheckoutModal"

export function Cart() {
  const { cart, updateQuantity, updateItemNotes, removeItem } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)

  const isEmpty = cart.items.length === 0

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart
            {!isEmpty && (
              <Badge variant="secondary" className="ml-auto">
                {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
              </Badge>
            )}
          </CardTitle>

          {/* Order Type Badge */}
          {cart.orderSetup && (
            <div className="flex items-center gap-2 pt-2">
              {cart.orderSetup.orderType === "DINE_IN" ? (
                <>
                  <UtensilsCrossed className="h-4 w-4 text-blue-600" />
                  <Badge className="bg-blue-600">Dine-In</Badge>
                  {cart.orderSetup.tableName && (
                    <span className="text-sm text-gray-600">
                      • {cart.orderSetup.tableName}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 text-orange-600" />
                  <Badge className="bg-orange-600">Takeaway</Badge>
                  {cart.orderSetup.customerName && (
                    <span className="text-sm text-gray-600">
                      • {cart.orderSetup.customerName}
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </CardHeader>

        <Separator />

        {/* Cart Items */}
        <ScrollArea className="flex-1">
          <CardContent className="p-4 space-y-4">
            {isEmpty ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Your cart is empty</p>
                <p className="text-gray-400 text-xs mt-1">
                  Add items from the menu to get started
                </p>
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
          </CardContent>
        </ScrollArea>

        {/* Totals */}
        {!isEmpty && (
          <>
            <Separator />
            <CardFooter className="flex flex-col gap-3 p-4">
              {/* Subtotal */}
              <div className="flex justify-between text-sm w-full">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  ${cart.subtotal.toFixed(2)}
                </span>
              </div>

              {/* Tax */}
              <div className="flex justify-between text-sm w-full">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-medium">${cart.tax.toFixed(2)}</span>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between text-lg font-bold w-full">
                <span>Total</span>
                <span className="text-primary">${cart.total.toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={() => setShowCheckout(true)}
              >
                Proceed to Checkout
              </Button>
            </CardFooter>
          </>
        )}
      </Card>

      {/* Checkout Modal */}
      <CheckoutModal
        open={showCheckout}
        onClose={() => setShowCheckout(false)}
      />
    </>
  )
}