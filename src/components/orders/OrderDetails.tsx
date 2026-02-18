"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { OrderStatusBadge } from "./OrderStatusBadge"
import { OrderTypeBadge } from "./OrderTypeBadge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Phone,
  Clock,
  DollarSign,
  CreditCard,
  FileText,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { OrderType } from "@prisma/client"

interface OrderDetailsProps {
  order: any
  onStatusUpdate?: () => void
}

export function OrderDetails({ order, onStatusUpdate }: OrderDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(order.status)

  const router = useRouter()

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status) {
      toast.info("Status is already set to " + selectedStatus)
      return
    }

    try {
      setIsUpdating(true)

      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: selectedStatus }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to update status")
      }

      toast.success(data.message || "Status updated")

      onStatusUpdate?.()
      router.refresh()
    } catch (error: any) {
      console.error("Error updating status:", error)
      toast.error(error.message || "Failed to update status")
      setSelectedStatus(order.status) // Reset on error
    } finally {
      setIsUpdating(false)
    }
  }

  const itemCount = order.orderItems.reduce(
    (total: number, item: any) => total + item.quantity,
    0
  )

  return (
    <div className="space-y-6">
      {/* Order Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">#{order.orderNumber}</CardTitle>
              <p className="text-sm text-gray-500">
                {format(new Date(order.createdAt), "PPpp")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <OrderTypeBadge type={order.orderType as OrderType} />
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Order Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order Type Specific Info */}
            {order.orderType === "DINE_IN" && order.table && (
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Table</p>
                  <p className="font-medium">Table {order.table.number}</p>
                </div>
              </div>
            )}

            {order.orderType === "TAKEAWAY" && (
              <>
                {order.customerName && (
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-medium">{order.customerName}</p>
                    </div>
                  </div>
                )}
                {order.customerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{order.customerPhone}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Cashier */}
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Cashier</p>
                <p className="font-medium">{order.user.name}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Payment</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{order.paymentMethod}</p>
                  <Badge
                    className={
                      order.paymentStatus === "PAID"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
              <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Order Notes</p>
                <p className="text-sm">{order.notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Status Card */}
      {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Update Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Order Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PREPARING">Preparing</SelectItem>
                    <SelectItem value="READY">Ready</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleStatusUpdate}
                disabled={isUpdating || selectedStatus === order.status}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Order Items ({itemCount} {itemCount === 1 ? "item" : "items"})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.orderItems.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  {item.menuItem.image && (
                    <img
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{item.menuItem.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.menuItem.category?.name}
                    </p>
                    {item.notes && (
                      <p className="text-sm text-gray-600 italic mt-1">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {item.quantity} × Rs {Number(item.price).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Rs {Number(item.subtotal).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">Rs {Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">Rs {Number(order.tax).toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-red-600">
                  -Rs {Number(order.discount).toFixed(2)}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">Rs {Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}