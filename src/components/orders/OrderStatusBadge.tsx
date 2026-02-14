import { Badge } from "@/components/ui/badge"
import { Clock, ChefHat, CheckCircle2, XCircle, Package } from "lucide-react"

interface OrderStatusBadgeProps {
  status: string
  size?: "sm" | "md" | "lg"
}

export function OrderStatusBadge({ status, size = "md" }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Pending",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: Clock,
        }
      case "PREPARING":
        return {
          label: "Preparing",
          className: "bg-blue-100 text-blue-800 border-blue-200",
          icon: ChefHat,
        }
      case "READY":
        return {
          label: "Ready",
          className: "bg-green-100 text-green-800 border-green-200",
          icon: Package,
        }
      case "COMPLETED":
        return {
          label: "Completed",
          className: "bg-gray-100 text-gray-800 border-gray-200",
          icon: CheckCircle2,
        }
      case "CANCELLED":
        return {
          label: "Cancelled",
          className: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
        }
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800",
          icon: Clock,
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  }

  return (
    <Badge className={`${config.className} ${sizeClasses[size]} flex items-center gap-1 font-medium`}>
      <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      {config.label}
    </Badge>
  )
}