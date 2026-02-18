"use client"

import { KitchenOrderCard } from "./KitchenOrderCard"
import { Loader2, ChefHat } from "lucide-react"
import type { PaymentMethod, PaymentStatus } from "@/types" // adjust the import path to match your project structure

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
  userId: string
  orderNumber: string
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY"
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED"
  createdAt: string
  updatedAt: string
  notes: string | null
  tableId: string | null
  table: {
    number: number
  } | null
  customerName: string | null
  customerPhone: string | null
  deliveryAddress: string | null
  deliveryNote: string | null
  deliveryFee: number
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: PaymentMethod | null
  paymentStatus: PaymentStatus
  orderItems: OrderItem[]
}

interface KitchenOrderListProps {
  orders: KitchenOrder[]
  isLoading: boolean
  onRefresh: () => void
}

export function KitchenOrderList({
  orders,
  isLoading,
  onRefresh,
}: KitchenOrderListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-3">
          <ChefHat className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-xl font-semibold mb-1">No Active Orders</h3>
            <p className="text-muted-foreground">
              All caught up! Waiting for new orders...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {orders.map((order) => (
        <KitchenOrderCard key={order.id} order={order} onStatusChange={onRefresh} />
      ))}
    </div>
  )
}