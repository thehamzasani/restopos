"use client"

import { useState, useEffect } from "react"
import { Table } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Users, Info } from "lucide-react"
import { toast } from "sonner"

interface TableSelectorProps {
  onSelect: (table: Table) => void
  onBack: () => void
}

export function TableSelector({ onSelect, onBack }: TableSelectorProps) {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    async function fetchTables() {
      try {
        setLoading(true)
        const response = await fetch("/api/tables")
        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error)
        }

        setTables(data.data || [])
      } catch (error) {
        console.error("Error fetching tables:", error)
        toast.error("Failed to load tables")
      } finally {
        setLoading(false)
      }
    }

    fetchTables()
  }, [toast])

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800 border-green-200"
      case "OCCUPIED":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "RESERVED":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTableStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Available"
      case "OCCUPIED":
        return "Occupied"
      case "RESERVED":
        return "Reserved"
      default:
        return status
    }
  }

  // ✅ NEW: Check if table has active orders
  const hasActiveOrders = (table: Table) => {
    return table._count && table._count.orders > 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  // Sort tables: Available first, then Occupied, then Reserved
  const sortedTables = [...tables].sort((a, b) => {
    const order = { AVAILABLE: 0, OCCUPIED: 1, RESERVED: 2 }
    return order[a.status as keyof typeof order] - order[b.status as keyof typeof order]
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Select Table</h2>
        <p className="text-gray-500">Choose a table for this dine-in order</p>
      </div>

      {/* Info Alert for Occupied Tables */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Occupied tables:</strong> Click to add more items to the existing order.
          The new items will be added to the current bill.
        </AlertDescription>
      </Alert>

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <Alert variant="destructive">
          <AlertDescription>
            No tables available. Please add tables in Settings.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedTables.map((table) => {
            const isOccupied = table.status === "OCCUPIED"
            const isReserved = table.status === "RESERVED"
            const isAvailable = table.status === "AVAILABLE"

            return (
              <Card
                key={table.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isReserved ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => {
                  if (!isReserved) {
                    onSelect(table)
                  } else {
                    toast.error("This table is reserved and cannot be used")
                  }
                }}
              >
                <CardContent className="p-6">
                  {/* Table Number */}
                  <div className="text-center mb-3">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {table.number}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Seats {table.capacity}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <Badge
                    className={`w-full justify-center ${getTableStatusColor(
                      table.status
                    )}`}
                  >
                    {getTableStatusText(table.status)}
                  </Badge>

                  {/* ✅ NEW: Show active orders count for occupied tables */}
                  {isOccupied && hasActiveOrders(table) && (
                    <div className="mt-2 text-xs text-center text-orange-600 font-medium">
                      {table._count!.orders} active order{table._count!.orders !== 1 ? 's' : ''}
                    </div>
                  )}

                  {/* ✅ NEW: Action hint */}
                  {isAvailable && (
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Click to start new order
                    </p>
                  )}
                  {isOccupied && (
                    <p className="text-xs text-center text-orange-600 mt-2">
                      Click to add to order
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Back Button */}
      <div className="pt-4">
        <Button variant="outline" onClick={onBack}>
          Back to Order Type
        </Button>
      </div>
    </div>
  )
}