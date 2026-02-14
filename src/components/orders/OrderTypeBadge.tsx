import { Badge } from "@/components/ui/badge"
import { UtensilsCrossed, Package } from "lucide-react"

interface OrderTypeBadgeProps {
  orderType: string
  size?: "sm" | "md" | "lg"
}

export function OrderTypeBadge({ orderType, size = "md" }: OrderTypeBadgeProps) {
  const isDineIn = orderType === "DINE_IN"

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  }

  const iconSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  if (isDineIn) {
    return (
      <Badge className={`bg-blue-100 text-blue-800 border-blue-200 ${sizeClasses[size]} flex items-center gap-1 font-medium`}>
        <UtensilsCrossed className={iconSize[size]} />
        Dine-In
      </Badge>
    )
  }

  return (
    <Badge className={`bg-orange-100 text-orange-800 border-orange-200 ${sizeClasses[size]} flex items-center gap-1 font-medium`}>
      <Package className={iconSize[size]} />
      Takeaway
    </Badge>
  )
}