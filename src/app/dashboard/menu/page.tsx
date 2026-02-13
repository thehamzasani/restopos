"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Filter } from "lucide-react"
import MenuItemCard from "@/components/menu/MenuItemCard"
import MenuItemForm from "@/components/menu/MenuItemForm"
import SearchBar from "@/components/shared/SearchBar"
import LoadingSpinner from "@/components/shared/LoadingSpinner"
import EmptyState from "@/components/shared/EmptyState"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function MenuItemsPage() {
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchMenuItems()
  }, [])

  useEffect(() => {
    fetchMenuItems()
  }, [selectedCategory, searchQuery, showAvailableOnly])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories?activeOnly=true")
      const data = await response.json()

      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchMenuItems = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()

      if (selectedCategory && selectedCategory !== "all") {
        params.append("categoryId", selectedCategory)
      }

      if (searchQuery) {
        params.append("search", searchQuery)
      }

      if (showAvailableOnly) {
        params.append("availableOnly", "true")
      }

      const response = await fetch(`/api/menu?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setMenuItems(data.data)
      }
    } catch (error) {
      toast.error("Failed to fetch menu items")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data: any) => {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Menu item created successfully")
        setIsFormOpen(false)
        fetchMenuItems()
      } else {
        toast.error(result.error || "Failed to create menu item")
      }
    } catch (error) {
      toast.error("Failed to create menu item")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (data: any) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/menu/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Menu item updated successfully")
        setIsFormOpen(false)
        setEditingItem(null)
        fetchMenuItems()
      } else {
        toast.error(result.error || "Failed to update menu item")
      }
    } catch (error) {
      toast.error("Failed to update menu item")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return

    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Menu item deleted successfully")
        fetchMenuItems()
      } else {
        toast.error(result.error || "Failed to delete menu item")
      }
    } catch (error) {
      toast.error("Failed to delete menu item")
    }
  }

  const handleToggleAvailable = async (id: string, isAvailable: boolean) => {
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(
          `Menu item ${isAvailable ? "marked available" : "marked unavailable"}`
        )
        fetchMenuItems()
      }
    } catch (error) {
      toast.error("Failed to update menu item")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Items</h1>
          <p className="text-gray-500">Manage your restaurant menu</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search menu items..."
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Available Only Toggle */}
        <Button
          variant={showAvailableOnly ? "default" : "outline"}
          onClick={() => setShowAvailableOnly(!showAvailableOnly)}
        >
          {showAvailableOnly ? "Available Only" : "All Items"}
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <Badge variant="secondary" className="text-sm">
          Total: {menuItems.length} items
        </Badge>
        <Badge variant="secondary" className="text-sm">
          Available: {menuItems.filter((item) => item.isAvailable).length}
        </Badge>
        <Badge variant="secondary" className="text-sm">
          Unavailable: {menuItems.filter((item) => !item.isAvailable).length}
        </Badge>
      </div>

      {/* Menu Items Grid */}
      {isLoading ? (
        <LoadingSpinner />
      ) : menuItems.length === 0 ? (
        <EmptyState
          title="No menu items found"
          description={
            searchQuery || selectedCategory !== "all"
              ? "Try adjusting your filters"
              : "Get started by adding your first menu item"
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <MenuItemCard
              key={item.id}
              menuItem={item}
              onEdit={(item) => {
                setEditingItem(item)
                setIsFormOpen(true)
              }}
              onDelete={handleDelete}
              onToggleAvailable={handleToggleAvailable}
            />
          ))}
        </div>
      )}

      {/* Menu Item Form Dialog */}
      <MenuItemForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingItem(null)
        }}
        onSubmit={editingItem ? handleEdit : handleCreate}
        categories={categories}
        initialData={editingItem}
        isLoading={isSubmitting}
      />
    </div>
  )
}