"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Users, AlertCircle } from "lucide-react"
import { Table } from "@/types"
import LoadingSpinner from "@/components/shared/LoadingSpinner"
import { toast } from "sonner"

interface TableSelectorProps {
  onSelect: (table: Table) => void
  onBack: () => void
}

export default function TableSelector({ onSelect, onBack }: TableSelectorProps) {
  const [tables, setTables] = useState<Table[]>([])
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/tables")
      const data = await response.json()

      if (data.success) {
        setTables(data.data)
      } else {
        toast.error(data.error || "Failed to fetch tables")
      }
    } catch (error) {
      toast.error("Failed to fetch tables")
    } finally {
      setIsLoading(false)
    }
  }

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800 border-green-300"
      case "OCCUPIED":
        return "bg-red-100 text-red-800 border-red-300"
      case "RESERVED":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
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

  if (isLoading) {
    return <LoadingSpinner />
  }

  const availableTables = tables.filter((t) => t.status === "AVAILABLE")
  const occupiedTables = tables.filter((t) => t.status !== "AVAILABLE")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Select Table</h2>
          <p className="text-gray-600">Choose a table for the dine-in order</p>
        </div>
      </div>

      {/* Info Alert */}
      {availableTables.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tables are currently available. All tables are occupied or reserved.
          </AlertDescription>
        </Alert>
      )}

      {/* Available Tables */}
      {availableTables.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-700">
            Available Tables ({availableTables.length})
          </h3>
          <ScrollArea className="h-[400px]">
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 pr-4">
              {availableTables.map((table) => (
                <Card
                  key={table.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-green-500"
                  onClick={() => onSelect(table)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="mb-3">
                      <div className="text-3xl font-bold text-gray-900">
                        {table.number}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{table.capacity} seats</span>
                      </div>
                    </div>
                    <Badge className={getTableStatusColor(table.status)}>
                      {getTableStatusText(table.status)}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Occupied/Reserved Tables */}
      {occupiedTables.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Unavailable Tables ({occupiedTables.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {occupiedTables.map((table) => (
              <Card
                key={table.id}
                className="opacity-60 cursor-not-allowed border-2"
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-3">
                    <div className="text-3xl font-bold text-gray-900">
                      {table.number}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{table.capacity} seats</span>
                    </div>
                  </div>
                  <Badge className={getTableStatusColor(table.status)}>
                    {getTableStatusText(table.status)}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}