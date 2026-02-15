// src/components/menu/IngredientManager.tsx

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface InventoryItem {
  id: string
  name: string
  unit: string
  quantity: number
  lowStockThreshold: number
}

interface Ingredient {
  id?: string
  inventoryId: string
  inventoryName?: string
  unit: string
  quantityUsed: number
  currentStock?: number
  lowStockThreshold?: number
}

interface IngredientManagerProps {
  menuItemId: string
  menuItemName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function IngredientManager({
  menuItemId,
  menuItemName,
  open,
  onOpenChange,
  onUpdate,
}: IngredientManagerProps) {

  const [loading, setLoading] = useState(false)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [saving, setSaving] = useState(false)

  // Fetch inventory items and current ingredients
  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open, menuItemId])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch all inventory items
      const inventoryRes = await fetch("/api/inventory")
      const inventoryData = await inventoryRes.json()

      if (inventoryData.success) {
        setInventoryItems(inventoryData.data)
      }

      // Fetch current ingredients
      const ingredientsRes = await fetch(
        `/api/menu/${menuItemId}/ingredients`
      )
      const ingredientsData = await ingredientsRes.json()

      if (ingredientsData.success) {
        setIngredients(
          ingredientsData.data.map((ing: any) => ({
            id: ing.id,
            inventoryId: ing.inventoryId,
            inventoryName: ing.inventoryName,
            unit: ing.unit,
            quantityUsed: ing.quantityUsed,
            currentStock: ing.currentStock,
            lowStockThreshold: ing.lowStockThreshold,
          }))
        )
      }
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        inventoryId: "",
        unit: "",
        quantityUsed: 0,
      },
    ])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: any
  ) => {
    const newIngredients = [...ingredients]

    // If changing inventory item
    if (field === "inventoryId") {
      const selected = inventoryItems.find((item) => item.id === value)
      if (selected) {
        newIngredients[index] = {
          ...newIngredients[index],
          inventoryId: value,
          inventoryName: selected.name,
          unit: selected.unit,
          currentStock: selected.quantity,
          lowStockThreshold: selected.lowStockThreshold,
        }
      }
    } else {
      newIngredients[index] = {
        ...newIngredients[index],
        [field]: value,
      }
    }

    setIngredients(newIngredients)
  }

  const handleSave = async () => {
    // Validate
    const invalidIngredients = ingredients.filter(
      (ing) => !ing.inventoryId || ing.quantityUsed <= 0
    )

    if (invalidIngredients.length > 0) {
      toast.error("Please fill all ingredient fields correctly")
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/menu/${menuItemId}/ingredients`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: ingredients.map((ing) => ({
            inventoryId: ing.inventoryId,
            quantityUsed: ing.quantityUsed,
          })),
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success("Ingredients updated successfully")
        onOpenChange(false)
        onUpdate?.()
      } else {
        toast.error(data.error || "Failed to update ingredients")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save ingredients")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Ingredients</DialogTitle>
          <DialogDescription>
            Define which inventory items are used in <strong>{menuItemName}</strong>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                When an order containing this menu item is completed, the
                specified quantities will be automatically deducted from
                inventory.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {ingredients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No ingredients added yet. Click "Add Ingredient" to start.
                </div>
              ) : (
                ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-4 items-end border rounded-lg p-4"
                  >
                    {/* Inventory Item Selection */}
                    <div className="col-span-5">
                      <Label>Inventory Item</Label>
                      <Select
                        value={ingredient.inventoryId}
                        onValueChange={(value) =>
                          updateIngredient(index, "inventoryId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems
                            .filter(
                              (item) =>
                                !ingredients.some(
                                  (ing, i) =>
                                    i !== index && ing.inventoryId === item.id
                                )
                            )
                            .map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.quantity} {item.unit})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quantity Used */}
                    <div className="col-span-3">
                      <Label>Quantity Used</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={ingredient.quantityUsed || ""}
                        onChange={(e) =>
                          updateIngredient(
                            index,
                            "quantityUsed",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>

                    {/* Unit (read-only) */}
                    <div className="col-span-3">
                      <Label>Unit</Label>
                      <Input
                        value={ingredient.unit || ""}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Delete Button */}
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeIngredient(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Stock Warning */}
                    {ingredient.currentStock !== undefined &&
                      ingredient.currentStock <=
                        (ingredient.lowStockThreshold || 0) && (
                        <div className="col-span-12">
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Low stock: Only {ingredient.currentStock}{" "}
                              {ingredient.unit} remaining
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                  </div>
                ))
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addIngredient}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Ingredient
            </Button>
          </>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}