"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UtensilsCrossed, Package } from "lucide-react"
import { OrderType } from "@prisma/client"

interface OrderTypeSelectorProps {
  onSelect: (orderType: OrderType) => void
}

export default function OrderTypeSelector({ onSelect }: OrderTypeSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Select Order Type</h2>
        <p className="mt-2 text-gray-600">
          Choose whether this is a dine-in or takeaway order
        </p>
      </div>

      {/* Order Type Cards */}
      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        {/* Dine-In Card */}
        <Card
          className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-blue-500"
          onClick={() => onSelect("DINE_IN")}
        >
          <CardContent className="p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-blue-100 p-6">
                <UtensilsCrossed className="h-16 w-16 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Dine-In</h3>
            <p className="text-gray-600 mb-6">
              Customer will eat at the restaurant
            </p>
            <Button
              size="lg"
              className="w-full"
              onClick={() => onSelect("DINE_IN")}
            >
              Select Dine-In
            </Button>
          </CardContent>
        </Card>

        {/* Takeaway Card */}
        <Card
          className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-orange-500"
          onClick={() => onSelect("TAKEAWAY")}
        >
          <CardContent className="p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-orange-100 p-6">
                <Package className="h-16 w-16 text-orange-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Takeaway</h3>
            <p className="text-gray-600 mb-6">
              Customer will take food to go
            </p>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
              onClick={() => onSelect("TAKEAWAY")}
            >
              Select Takeaway
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}