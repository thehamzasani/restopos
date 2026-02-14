"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, X } from "lucide-react"

interface OrderFiltersProps {
  onFilterChange: (filters: OrderFilterValues) => void
}

export interface OrderFilterValues {
  search: string
  status: string
  orderType: string
  paymentStatus: string
  startDate: string
  endDate: string
}

export function OrderFilters({ onFilterChange }: OrderFiltersProps) {
  const [filters, setFilters] = useState<OrderFilterValues>({
    search: "",
    status: "all",
    orderType: "all",
    paymentStatus: "all",
    startDate: "",
    endDate: "",
  })

  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (key: keyof OrderFilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters: OrderFilterValues = {
      search: "",
      status: "all",
      orderType: "all",
      paymentStatus: "all",
      startDate: "",
      endDate: "",
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.orderType !== "all" ||
    filters.paymentStatus !== "all" ||
    filters.startDate ||
    filters.endDate

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by order number..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 bg-primary-foreground text-primary rounded-full px-2 py-0.5 text-xs">
              {Object.values(filters).filter((v) => v && v !== "all").length}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Order Status Filter */}
              <div className="space-y-2">
                <Label>Order Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PREPARING">Preparing</SelectItem>
                    <SelectItem value="READY">Ready</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Order Type Filter */}
              <div className="space-y-2">
                <Label>Order Type</Label>
                <Select
                  value={filters.orderType}
                  onValueChange={(value) => handleFilterChange("orderType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="DINE_IN">Dine-In</SelectItem>
                    <SelectItem value="TAKEAWAY">Takeaway</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Status Filter */}
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select
                  value={filters.paymentStatus}
                  onValueChange={(value) => handleFilterChange("paymentStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                />
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasActiveFilters}
                  className="w-full gap-2"
                >
                  <X className="h-4 w-4" />
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}