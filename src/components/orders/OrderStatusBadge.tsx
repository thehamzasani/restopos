// src/components/orders/OrderStatusBadge.tsx
import { Badge } from "@/components/ui/badge"
import { OrderStatus } from "@/types"
import {
  Clock,
  ChefHat,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Bike,
} from "lucide-react"

interface OrderStatusBadgeProps {
  status: OrderStatus
  size?: "sm" | "default"
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  PREPARING: {
    label: "Preparing",
    icon: ChefHat,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  READY: {
    label: "Ready",
    icon: ShoppingBag,
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    icon: Bike,
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-green-50 text-green-700 border-green-200",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-50 text-red-700 border-red-200",
  },
}

export  function OrderStatusBadge({ status, size = "default" }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING
  const Icon = config.icon
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"

  return (
    <Badge
      variant="outline"
      className={`font-medium flex items-center gap-1 w-fit ${config.className}`}
    >
      <Icon className={iconSize} />
      {config.label}
    </Badge>
  )
}