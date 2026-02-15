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
import { Plus } from "lucide-react"
import { MenuItemCard } from "@/components/menu/MenuItemCard"
import { MenuItemForm } from "@/components/menu/MenuItemForm"
import SearchBar from "@/components/shared/SearchBar"
import { toast } from "sonner"  // ✅ Changed to Sonner
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

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  async function fetchMenuItems() {
    try {
      setIsLoading(true)
      const res = await fetch("/api/menu")
      const data = await res.json()
      if (data.success) {
        setMenuItems(data.data)
      }
    } catch (error) {
      console.error("Error fetching menu items:", error)
      toast.error("Failed to load menu items")  // ✅ Sonner
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(formData: any) {
    setIsSubmitting(true)
    try {
      const url = editingItem ? `/api/menu/${editingItem.id}` : "/api/menu"
      const method = editingItem ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        toast.success(
          editingItem
            ? "Menu item updated successfully"
            : "Menu item created successfully"
        )  // ✅ Sonner
        setIsFormOpen(false)
        setEditingItem(null)
        fetchMenuItems()
      } else {
        toast.error(data.error || "Failed to save menu item")  // ✅ Sonner
      }
    } catch (error) {
      toast.error("An error occurred")  // ✅ Sonner
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this menu item?")) {
      return
    }

    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (data.success) {
        toast.success("Menu item deleted successfully")  // ✅ Sonner
        fetchMenuItems()
      } else {
        toast.error(data.error || "Failed to delete menu item")  // ✅ Sonner
      }
    } catch (error) {
      toast.error("Failed to delete menu item")  // ✅ Sonner
    }
  }

  function handleEdit(item: any) {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  function handleCreate() {
    setEditingItem(null)
    setIsFormOpen(true)
  }

  // Filter menu items
  const filteredMenuItems = menuItems.filter((item) => {
    // Search filter
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase()))

    // Category filter
    const matchesCategory =
      selectedCategory === "all" || item.categoryId === selectedCategory

    // Available filter
    const matchesAvailable = !showAvailableOnly || item.isAvailable

    return matchesSearch && matchesCategory && matchesAvailable
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Items</h1>
          <p className="text-gray-600 mt-1">
            Manage your restaurant menu items
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search menu items..."
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
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

        <Button
          variant={showAvailableOnly ? "default" : "outline"}
          onClick={() => setShowAvailableOnly(!showAvailableOnly)}
        >
          {showAvailableOnly ? "Show All" : "Available Only"}
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <Badge variant="secondary">
          Total: {filteredMenuItems.length}
        </Badge>
        <Badge variant="secondary">
          Available:{" "}
          {filteredMenuItems.filter((item) => item.isAvailable).length}
        </Badge>
      </div>

      {/* Menu Items Grid */}
      {filteredMenuItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery || selectedCategory !== "all" || showAvailableOnly
              ? "No menu items found matching your filters"
              : "No menu items yet. Create your first menu item!"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {/* ✅ Changed to show 4-5 cards per row */}
          {filteredMenuItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRefresh={fetchMenuItems}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <MenuItemForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingItem(null)
        }}
        onSubmit={handleSubmit}
        categories={categories}
        initialData={editingItem}
        isLoading={isSubmitting}
      />
    </div>
  )
}