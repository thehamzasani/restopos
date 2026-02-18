"use client"
// src/components/pos/OrderTypeSelector.tsx

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UtensilsCrossed, Package, Bike } from "lucide-react"
import { OrderType } from "@/types"

interface OrderTypeSelectorProps {
  onSelect: (orderType: OrderType) => void
}

const ORDER_TYPES = [
  {
    type: "DINE_IN" as OrderType,
    label: "Dine-In",
    description: "Customer eats at the restaurant",
    icon: UtensilsCrossed,
    color: "blue",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    borderHover: "hover:border-blue-500",
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  {
    type: "TAKEAWAY" as OrderType,
    label: "Takeaway",
    description: "Customer picks up the food",
    icon: Package,
    color: "orange",
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600",
    borderHover: "hover:border-orange-500",
    buttonClass: "bg-orange-600 hover:bg-orange-700 text-white",
  },
  {
    type: "DELIVERY" as OrderType,
    label: "Delivery",
    description: "Food delivered to customer's address",
    icon: Bike,
    color: "green",
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
    borderHover: "hover:border-green-500",
    buttonClass: "bg-green-600 hover:bg-green-700 text-white",
  },
]

export default function OrderTypeSelector({ onSelect }: OrderTypeSelectorProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Select Order Type</h2>
        <p className="mt-2 text-gray-500 text-base">
          Choose how the customer would like to receive their order
        </p>
      </div>

      {/* Order Type Cards */}
      <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
        {ORDER_TYPES.map(
          ({ type, label, description, icon: Icon, bgColor, iconColor, borderHover, buttonClass }) => (
            <Card
              key={type}
              className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-opacity-100 ${borderHover}`}
              onClick={() => onSelect(type)}
            >
              <CardContent className="p-8 text-center flex flex-col items-center gap-4">
                <div className={`rounded-full ${bgColor} p-5`}>
                  <Icon className={`h-12 w-12 ${iconColor}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{label}</h3>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
                <Button
                  size="lg"
                  className={`w-full mt-2 ${buttonClass}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(type)
                  }}
                >
                  Select {label}
                </Button>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  )
}