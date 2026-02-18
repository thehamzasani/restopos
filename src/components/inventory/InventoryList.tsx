// src/components/inventory/InventoryList.tsx

"use client"

import { useState } from "react"
import useSWR from "swr"
import { InventoryCard } from "./InventoryCard"
import { InventoryForm } from "./InventoryForm"
import { LowStockAlert } from "./LowStockAlert"
import  SearchBar from "@/components/shared/SearchBar"
import { Button } from "@/components/ui/button"
import { Plus, Filter, PackageOpen } from "lucide-react"
import  {LoadingSpinner}  from "@/components/shared/LoadingSpinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function InventoryList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Fetch inventory
  const { data, error, isLoading, mutate } = useSWR(
    `/api/inventory?search=${searchQuery}&lowStock=${showLowStockOnly}`,
    fetcher,
    { refreshInterval: 10000 }
  )

  // Fetch low stock alerts
  const { data: alertsData } = useSWR("/api/inventory/alerts", fetcher, {
    refreshInterval: 30000,
  })

  const inventory = data?.data || []
  const lowStockAlerts = alertsData?.data || []

  const handleCreate = () => {
    setEditingItem(null)
    setIsFormOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setEditingItem(null)
    mutate()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Failed to load inventory
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-gray-600">Manage your stock and supplies</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <LowStockAlert items={lowStockAlerts} onRestock={mutate} />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search inventory..."
          />
        </div>
        <Button
          variant={showLowStockOnly ? "default" : "outline"}
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
        >
          <Filter className="h-4 w-4 mr-2" />
          {showLowStockOnly ? "Show All" : "Low Stock Only"}
          {showLowStockOnly && lowStockAlerts.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {lowStockAlerts.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Inventory Grid */}
      {inventory.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <PackageOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No inventory items found
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery
                ? "Try adjusting your search"
                : "Get started by adding your first inventory item"}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inventory.map((item: any) => (
            <InventoryCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onUpdate={mutate}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
            </DialogTitle>
          </DialogHeader>
          <InventoryForm
            item={editingItem}
            onSuccess={handleSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}