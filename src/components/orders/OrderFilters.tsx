"use client"
// src/components/orders/OrderFilters.tsx

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X, SlidersHorizontal } from "lucide-react"

export interface OrderFilterValues {
  search: string
  status: string
  orderType: string
  paymentStatus: string
  startDate: string
  endDate: string
}

interface OrderFiltersProps {
  filters: OrderFilterValues
  onFilterChange: (filters: OrderFilterValues) => void
}

const ORDER_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
]

const ORDER_TYPES = [
  { value: "all", label: "All Types" },
  { value: "DINE_IN", label: "🍽️ Dine-In" },
  { value: "TAKEAWAY", label: "📦 Takeaway" },
  { value: "DELIVERY", label: "🛵 Delivery" },
]

const PAYMENT_STATUSES = [
  { value: "all", label: "All Payments" },
  { value: "PENDING", label: "Unpaid" },
  { value: "PAID", label: "Paid" },
  { value: "REFUNDED", label: "Refunded" },
]

const DEFAULT_FILTERS: OrderFilterValues = {
  search: "",
  status: "all",
  orderType: "all",
  paymentStatus: "all",
  startDate: "",
  endDate: "",
}

export  function OrderFilters({ filters = DEFAULT_FILTERS, onFilterChange }: OrderFiltersProps) {
  if (!filters) return null;
  const hasActiveFilters =
    filters.status !== "all" ||
    filters.orderType !== "all" ||
    filters.paymentStatus !== "all" ||
    filters.startDate !== "" ||
    filters.endDate !== ""

  const update = (key: keyof OrderFilterValues, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const clearAll = () => {
    onFilterChange(DEFAULT_FILTERS)
  }

  return (
    <div className="space-y-3">
      {/* Search + Clear */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by order number, customer name, or phone..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="pl-9"
          />
          {filters.search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => update("search", "")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearAll} className="shrink-0 gap-1">
            <X className="h-3 w-3" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-2 items-center">
        <SlidersHorizontal className="h-4 w-4 text-gray-400" />

        <Select value={filters.status} onValueChange={(v) => update("status", v)}>
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.orderType} onValueChange={(v) => update("orderType", v)}>
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="Order Type" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.paymentStatus} onValueChange={(v) => update("paymentStatus", v)}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_STATUSES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            className="h-9 w-36 text-sm"
          />
          <span className="text-gray-400 text-sm">to</span>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => update("endDate", e.target.value)}
            className="h-9 w-36 text-sm"
          />
        </div>

        {/* Active Filter Badges */}
        {filters.status !== "all" && (
          <Badge variant="secondary" className="h-7 gap-1 pl-2">
            Status: {filters.status}
            <button onClick={() => update("status", "all")}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {filters.orderType !== "all" && (
          <Badge variant="secondary" className="h-7 gap-1 pl-2">
            {filters.orderType.replace("_", "-")}
            <button onClick={() => update("orderType", "all")}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>
    </div>
  )
}