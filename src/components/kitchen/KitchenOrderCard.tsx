"use client"
// src/components/kitchen/KitchenOrderCard.tsx

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  UtensilsCrossed,
  Package,
  Bike,
  Clock,
  ChefHat,
  ShoppingBag,
  Truck,
  AlertTriangle,
  User,
  Phone,
  MapPin,
} from "lucide-react"
import { Order } from "@/types"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

interface KitchenOrderCardProps {
  order: Order
  onStatusChange: (orderId: string, status: string) => void
}

function useOrderTimer(createdAt: Date) {
  const minutesAgo = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 1000 / 60
  )
  return minutesAgo
}

function OrderTypeHeader({ order }: { order: Order }) {
  if (order.orderType === "DINE_IN") {
    return (
      <div className="flex items-center gap-2 py-2 px-3 bg-blue-50 rounded-lg">
        <UtensilsCrossed className="h-5 w-5 text-blue-600 shrink-0" />
        <div>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Dine-In</p>
          <p className="text-lg font-bold text-blue-900">
            Table {order.table?.number ?? "?"}
          </p>
        </div>
      </div>
    )
  }

  if (order.orderType === "TAKEAWAY") {
    return (
      <div className="flex items-center gap-2 py-2 px-3 bg-orange-50 rounded-lg">
        <Package className="h-5 w-5 text-orange-600 shrink-0" />
        <div>
          <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">Takeaway</p>
          <p className="text-base font-bold text-orange-900">
            {order.customerName ?? "Walk-in"}
          </p>
          {order.customerPhone && (
            <p className="text-xs text-orange-600 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {order.customerPhone}
            </p>
          )}
        </div>
      </div>
    )
  }

  // DELIVERY
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 py-2 px-3 bg-green-50 rounded-lg">
        <Bike className="h-5 w-5 text-green-600 shrink-0" />
        <div>
          <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Delivery</p>
          <p className="text-base font-bold text-green-900">
            {order.customerName ?? "Delivery Order"}
          </p>
          {order.customerPhone && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {order.customerPhone}
            </p>
          )}
        </div>
      </div>
      {order.deliveryAddress && (
        <div className="flex items-start gap-2 px-3 py-2 bg-gray-50 rounded-lg">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-600 break-words">{order.deliveryAddress}</p>
        </div>
      )}
      {order.deliveryNote && (
        <div className="px-3 py-1.5 bg-yellow-50 rounded-lg border border-yellow-100">
          <p className="text-xs text-yellow-700">
            <span className="font-semibold">Note:</span> {order.deliveryNote}
          </p>
        </div>
      )}
    </div>
  )
}

function TimerBadge({ minutes }: { minutes: number }) {
  const color =
    minutes < 10
      ? "bg-green-100 text-green-700 border-green-200"
      : minutes < 20
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-red-100 text-red-700 border-red-200 animate-pulse"

  return (
    <Badge variant="outline" className={`flex items-center gap-1 font-mono ${color}`}>
      <Clock className="h-3 w-3" />
      {minutes}m
    </Badge>
  )
}

function StatusActions({
  status,
  orderType,
  onAction,
  loading,
}: {
  status: string
  orderType: string
  onAction: (newStatus: string) => void
  loading: boolean
}) {
  if (status === "PENDING") {
    return (
      <Button
        className="w-full bg-blue-600 hover:bg-blue-700"
        onClick={() => onAction("PREPARING")}
        disabled={loading}
      >
        <ChefHat className="h-4 w-4 mr-2" />
        Start Preparing
      </Button>
    )
  }

  if (status === "PREPARING") {
    return (
      <Button
        className="w-full bg-purple-600 hover:bg-purple-700"
        onClick={() => onAction("READY")}
        disabled={loading}
      >
        <ShoppingBag className="h-4 w-4 mr-2" />
        Mark as Ready
      </Button>
    )
  }

  if (status === "READY" && orderType === "DELIVERY") {
    return (
      <Button
        className="w-full bg-indigo-600 hover:bg-indigo-700"
        onClick={() => onAction("OUT_FOR_DELIVERY")}
        disabled={loading}
      >
        <Truck className="h-4 w-4 mr-2" />
        Out for Delivery
      </Button>
    )
  }

  if (status === "READY" || status === "OUT_FOR_DELIVERY") {
    return (
      <Button
        className="w-full bg-green-600 hover:bg-green-700"
        onClick={() => onAction("COMPLETED")}
        disabled={loading}
      >
        <Package className="h-4 w-4 mr-2" />
        Complete Order
      </Button>
    )
  }

  return null
}

export  function KitchenOrderCard({ order, onStatusChange }: KitchenOrderCardProps) {
  const [loading, setLoading] = useState(false)
  const minutes = useOrderTimer(order.createdAt)

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      onStatusChange(order.id, newStatus)
      toast.success(`Order #${order.orderNumber} → ${newStatus.replace("_", " ")}`)
    } catch (error: any) {
      toast.error(error.message ?? "Failed to update status")
    } finally {
      setLoading(false)
    }
  }

  const isUrgent = minutes >= 20

  return (
    <Card
      className={`flex flex-col transition-all ${
        isUrgent ? "border-red-300 shadow-red-100 shadow-md" : "border-gray-200"
      }`}
    >
      <CardHeader className="pb-2 pt-3 px-4">
        {/* Order Number + Timer */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-gray-500 font-medium">ORDER</p>
            <p className="text-lg font-bold text-gray-900">#{order.orderNumber}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <TimerBadge minutes={minutes} />
            {isUrgent && (
              <span className="flex items-center gap-1 text-xs text-red-600">
                <AlertTriangle className="h-3 w-3" />
                Urgent!
              </span>
            )}
          </div>
        </div>

        {/* Order Type Info */}
        <OrderTypeHeader order={order} />
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 px-4 pb-4">
        <Separator />

        {/* Items */}
        <div className="space-y-2 flex-1">
          {order.orderItems?.map((item) => (
            <div key={item.id} className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900 min-w-[2rem] text-center">
                  {item.quantity}×
                </span>
                <span className="text-base font-semibold text-gray-800">
                  {item.menuItem?.name ?? "Unknown Item"}
                </span>
              </div>
              {item.notes && (
                <p className="ml-10 text-sm text-amber-700 bg-amber-50 rounded px-2 py-0.5 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  {item.notes}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* General Notes */}
        {order.notes && (
          <div className="bg-gray-50 rounded-lg p-2 text-sm text-gray-600">
            <span className="font-medium">Note:</span> {order.notes}
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        <StatusActions
          status={order.status}
          orderType={order.orderType}
          onAction={handleStatusChange}
          loading={loading}
        />
      </CardContent>
    </Card>
  )
}