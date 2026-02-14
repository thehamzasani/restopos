"use client"

import { useState, useEffect } from "react"
import { MenuItem, Category } from "@/types"
import { MenuItemCard } from "./MenuItemCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

export function MenuGrid() {
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  const { addItem } = useCart()


  // Fetch categories and menu items
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch categories
        const categoriesRes = await fetch("/api/categories")
        const categoriesData = await categoriesRes.json()

        if (!categoriesData.success) {
          throw new Error(categoriesData.error)
        }

        // Fetch menu items
        const menuRes = await fetch("/api/menu")
        const menuData = await menuRes.json()

        if (!menuData.success) {
          throw new Error(menuData.error)
        }

        setCategories(categoriesData.data || [])
        setMenuItems(menuData.data || [])
      } catch (error) {
        console.error("Error fetching menu data:", error)
        toast.error("Failed to load menu items")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Filter menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory
      ? item.categoryId === selectedCategory
      : true
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: 1,
      image: item.image,
    })

    toast.success(`${item.name} has been added to your cart`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filter */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No menu items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  )
}