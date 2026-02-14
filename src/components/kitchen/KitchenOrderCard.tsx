"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrderTimer } from "./OrderTimer"
import { UtensilsCrossed, Package, User, Phone, Hash, ChefHat, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface OrderItem {
  id: string
  quantity: number
  notes: string | null
  menuItem: {
    id: string
    name: string
    image: string | null
  }
}

interface KitchenOrder {
  id: string
  orderNumber: string
  orderType: "DINE_IN" | "TAKEAWAY"
  status: string
  createdAt: string
  notes: string | null
  table: {
    number: number
  } | null
  customerName: string | null
  customerPhone: string | null
  orderItems: OrderItem[]
}

interface KitchenOrderCardProps {
  order: KitchenOrder
  onStatusChange: () => void
}

export function KitchenOrderCard({ order, onStatusChange }: KitchenOrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      toast.success(`Order ${order.orderNumber} marked as ${newStatus.toLowerCase()}`)
      onStatusChange()
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update order status")
    } finally {
      setIsUpdating(false)
    }
  }

  // Card border color based on time
  const getCardClass = () => {
    const minutesAgo = Math.floor(
      (new Date().getTime() - new Date(order.createdAt).getTime()) / 60000
    )
    if (minutesAgo < 10) return "border-l-4 border-l-green-500"
    if (minutesAgo < 20) return "border-l-4 border-l-yellow-500"
    return "border-l-4 border-l-red-500 shadow-lg"
  }

  return (
    <Card className={`${getCardClass()} hover:shadow-xl transition-shadow h-full`}>
      <CardHeader className="space-y-2 pb-3">
        {/* Order Number and Timer - Compact */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-xl font-bold">{order.orderNumber}</span>
          </div>
          <OrderTimer createdAt={order.createdAt} />
        </div>

        {/* Order Type - Compact Badge */}
        {order.orderType === "DINE_IN" ? (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
            <UtensilsCrossed className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <div className="text-xs font-medium text-blue-600">DINE-IN</div>
              <div className="text-lg font-bold text-blue-900">
                Table {order.table?.number}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-md">
            <Package className="h-5 w-5 text-orange-600" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-orange-600">TAKEAWAY</div>
              {order.customerName && (
                <div className="flex items-center gap-1 mt-0.5">
                  <User className="h-3 w-3 text-orange-600 flex-shrink-0" />
                  <span className="text-sm font-semibold text-orange-900 truncate">
                    {order.customerName}
                  </span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-orange-600 flex-shrink-0" />
                  <span className="text-xs text-orange-700">
                    {order.customerPhone}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Notes - Compact */}
        {order.notes && (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs font-medium text-yellow-800">
              📝 {order.notes}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-2 py-3">
        {/* Order Items - Compact List */}
        <div className="space-y-1.5">
          {order.orderItems.map((item) => {
            if (!item.menuItem) {
              console.error('Missing menuItem for orderItem:', item.id)
              return null
            }

            return (
              <div
                key={item.id}
                className="flex items-start gap-2 p-2 bg-gray-50 rounded-md"
              >
                {/* Item Image - Smaller */}
                {item.menuItem.image && (
                  <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Item Details - Compact */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-1.5">
                    <span className="text-lg font-bold text-primary flex-shrink-0">
                      {item.quantity}×
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold leading-tight truncate">
                        {item.menuItem.name}
                      </h4>
                      {item.notes && (
                        <p className="text-xs text-red-600 font-medium mt-0.5 flex items-center gap-1">
                          <span>⚠️</span>
                          <span className="truncate">{item.notes}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>

      <CardFooter className="pt-3 pb-3">
        {order.status === "PENDING" && (
          <Button
            onClick={() => handleStatusChange("PREPARING")}
            disabled={isUpdating}
            className="w-full h-10"
            variant="default"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <ChefHat className="mr-2 h-4 w-4" />
                Start Preparing
              </>
            )}
          </Button>
        )}

        {order.status === "PREPARING" && (
          <Button
            onClick={() => handleStatusChange("READY")}
            disabled={isUpdating}
            className="w-full h-10"
            variant="default"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Ready
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}