// src/components/orders/OrderTypeBadge.tsx
import { Badge } from "@/components/ui/badge"
import { UtensilsCrossed, Package, Bike } from "lucide-react"
import { OrderType } from "@/types"

interface OrderTypeBadgeProps {
  type: OrderType
  size?: "sm" | "default"
}

export  function OrderTypeBadge({ type, size = "default" }: OrderTypeBadgeProps) {
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"

  if (type === "DINE_IN") {
    return (
      <Badge
        variant="outline"
        className="bg-blue-50 text-blue-700 border-blue-200 font-medium flex items-center gap-1 w-fit"
      >
        <UtensilsCrossed className={iconSize} />
        {size === "default" ? "Dine-In" : "Dine"}
      </Badge>
    )
  }

  if (type === "TAKEAWAY") {
    return (
      <Badge
        variant="outline"
        className="bg-orange-50 text-orange-700 border-orange-200 font-medium flex items-center gap-1 w-fit"
      >
        <Package className={iconSize} />
        Takeaway
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className="bg-green-50 text-green-700 border-green-200 font-medium flex items-center gap-1 w-fit"
    >
      <Bike className={iconSize} />
      Delivery
    </Badge>
  )
}