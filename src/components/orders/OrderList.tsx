"use client"

import { useState, useEffect } from "react"
import { OrderCard } from "./OrderCard"
import { OrderFilters, OrderFilterValues } from "./OrderFilters"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function OrderList() {
  const [filters, setFilters] = useState<OrderFilterValues>({
    search: "",
    status: "all",
    orderType: "all",
    paymentStatus: "all",
    startDate: "",
    endDate: "",
  })



  // Build query string from filters
  const queryParams = new URLSearchParams()
  if (filters.search) queryParams.append("search", filters.search)
  if (filters.status !== "all") queryParams.append("status", filters.status)
  if (filters.orderType !== "all") queryParams.append("orderType", filters.orderType)
  if (filters.paymentStatus !== "all") queryParams.append("paymentStatus", filters.paymentStatus)
  if (filters.startDate) queryParams.append("startDate", filters.startDate)
  if (filters.endDate) queryParams.append("endDate", filters.endDate)

  const { data, error, isLoading } = useSWR(
    `/api/orders?${queryParams.toString()}`,
    fetcher,
    {
      refreshInterval: 5000, // Auto-refresh every 5 seconds
    }
  )

  if (error) {
    toast.error("Failed to load orders")
  }

  const orders = data?.data || []

  // Quick filter tabs
  const handleQuickFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, status }))
  }

  return (
    <div className="space-y-6">
      {/* Quick Filter Tabs */}
      <Tabs defaultValue="all" onValueChange={handleQuickFilter}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="PREPARING">Preparing</TabsTrigger>
          <TabsTrigger value="READY">Ready</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Advanced Filters */}
      <OrderFilters onFilterChange={setFilters} />

      {/* Orders Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No orders found</p>
          <p className="text-gray-400 text-sm mt-2">
            Try adjusting your filters or create a new order
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order: any) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Order Count */}
      <div className="text-center text-sm text-gray-500">
        Showing {orders.length} {orders.length === 1 ? "order" : "orders"}
      </div>
    </div>
  )
}