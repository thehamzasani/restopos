"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "./OrderStatusBadge"
import { OrderTypeBadge } from "./OrderTypeBadge"
import { Eye, Clock, DollarSign, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import type { OrderType } from "@/types"
import { OrderStatus } from "@prisma/client"
interface Order {
  id: string
  orderNumber: string
  orderType: string
  status: string
  total: number
  paymentStatus: string
  createdAt: Date | string
  table?: {
    number: number
  } | null
  customerName?: string | null
  user: {
    name: string
  }
  orderItems: any[]
}

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  const router = useRouter()

  const createdAt = new Date(order.createdAt)
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true })

  const itemCount = order.orderItems.reduce(
    (total, item) => total + item.quantity,
    0
  )

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header: Order Number & Badges */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
              <div className="flex flex-wrap items-center gap-2">
                <OrderTypeBadge type={order.orderType as OrderType} size="sm" />
               <OrderStatusBadge status={order.status as OrderStatus} size="sm" />
                {order.paymentStatus === "PAID" && (
                  <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                    Paid
                  </Badge>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/dashboard/orders/${order.id}`)}
              className="gap-1"
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
          </div>

          {/* Order Details */}
          <div className="space-y-2 text-sm">
            {/* Table or Customer */}
            {order.orderType === "DINE_IN" && order.table && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span>Table {order.table.number}</span>
              </div>
            )}
            {order.orderType === "TAKEAWAY" && order.customerName && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span>{order.customerName}</span>
              </div>
            )}

            {/* Items Count */}
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                {itemCount} {itemCount === 1 ? "item" : "items"} • {timeAgo}
              </span>
            </div>

            {/* Total */}
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-semibold text-base text-primary">
                Rs {Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Footer: Cashier */}
          <div className="pt-2 border-t text-xs text-gray-500">
            Cashier: {order.user.name}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}