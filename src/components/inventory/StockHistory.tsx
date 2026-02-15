// src/components/inventory/StockHistory.tsx

"use client"

import useSWR from "swr"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import LoadingSpinner  from "@/components/shared/LoadingSpinner"
import { TrendingUp, TrendingDown, RefreshCw, Package } from "lucide-react"

interface StockHistoryProps {
  itemId: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function StockHistory({ itemId }: StockHistoryProps) {
  const { data, error, isLoading } = useSWR(
    `/api/inventory/${itemId}`,
    fetcher
  )

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Failed to load history</div>
  }

  const stockHistory = data?.data?.stockHistory || []

  if (stockHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-gray-100 p-4 mb-3">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="font-medium text-gray-900 mb-1">No stock history</h4>
          <p className="text-sm text-gray-500">Stock movements will appear here</p>
        </div>
      </div>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "IN":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "OUT":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "ADJUSTMENT":
        return <RefreshCw className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "IN":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Stock In
          </Badge>
        )
      case "OUT":
        return (
          <Badge variant="default" className="bg-red-100 text-red-800">
            Stock Out
          </Badge>
        )
      case "ADJUSTMENT":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            Adjustment
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">Stock Movements</h4>
        <p className="text-sm text-gray-500">{stockHistory.length} entries</p>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {stockHistory.map((entry: any) => (
          <div
            key={entry.id}
            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="mt-1">{getTypeIcon(entry.type)}</div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                {getTypeBadge(entry.type)}
                <span className="font-semibold">
                  {entry.type === "OUT" ? "-" : "+"}
                  {entry.quantity} {data.data.unit}
                </span>
              </div>
              
              {entry.reason && (
                <p className="text-sm text-gray-600 mb-1">{entry.reason}</p>
              )}
              
              <p className="text-xs text-gray-500">
                {format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}