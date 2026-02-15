// src/components/inventory/InventoryForm.tsx

"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { inventorySchema, InventoryInput } from "@/lib/validations/inventory"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useSWR from "swr"

interface InventoryFormProps {
  item?: any
  onSuccess: () => void
  onCancel: () => void
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function InventoryForm({ item, onSuccess, onCancel }: InventoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch suppliers
  const { data: suppliersData } = useSWR("/api/suppliers", fetcher)
  const suppliers = suppliersData?.data || []

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<InventoryInput>({
    resolver: zodResolver(inventorySchema),
    defaultValues: item || {
      name: "",
      description: "",
      quantity: 0,
      unit: "kg",
      lowStockThreshold: 0,
      costPerUnit: 0,
      supplierId: undefined,
    },
  })

  const selectedSupplierId = watch("supplierId")
  const selectedUnit = watch("unit")

  const onSubmit = async (data: InventoryInput) => {
    setIsSubmitting(true)
    try {
      const url = item ? `/api/inventory/${item.id}` : "/api/inventory"
      const method = item ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message || "Inventory item saved successfully")
        onSuccess()
      } else {
        toast.error(result.error || "Failed to save inventory item")
      }
    } catch (error) {
      console.error("Error saving inventory:", error)
      toast.error("Failed to save inventory item")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <Label htmlFor="name">
          Item Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="E.g., Chicken Breast, Flour, Olive Oil"
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Optional description or notes"
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Quantity and Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">
            Quantity <span className="text-red-500">*</span>
          </Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            {...register("quantity", { valueAsNumber: true })}
            placeholder="0.00"
          />
          {errors.quantity && (
            <p className="text-sm text-red-500 mt-1">
              {errors.quantity.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="unit">
            Unit <span className="text-red-500">*</span>
          </Label>
          <Select
            value={selectedUnit}
            onValueChange={(value) => setValue("unit", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">Kilograms (kg)</SelectItem>
              <SelectItem value="g">Grams (g)</SelectItem>
              <SelectItem value="l">Liters (l)</SelectItem>
              <SelectItem value="ml">Milliliters (ml)</SelectItem>
              <SelectItem value="pieces">Pieces</SelectItem>
              <SelectItem value="dozen">Dozen</SelectItem>
              <SelectItem value="pack">Pack</SelectItem>
              <SelectItem value="box">Box</SelectItem>
              <SelectItem value="bag">Bag</SelectItem>
            </SelectContent>
          </Select>
          {errors.unit && (
            <p className="text-sm text-red-500 mt-1">{errors.unit.message}</p>
          )}
        </div>
      </div>

      {/* Low Stock Threshold and Cost Per Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lowStockThreshold">
            Low Stock Threshold <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lowStockThreshold"
            type="number"
            step="0.01"
            {...register("lowStockThreshold", { valueAsNumber: true })}
            placeholder="0.00"
          />
          <p className="text-xs text-gray-500 mt-1">
            Alert when stock falls below this level
          </p>
          {errors.lowStockThreshold && (
            <p className="text-sm text-red-500 mt-1">
              {errors.lowStockThreshold.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="costPerUnit">Cost Per Unit</Label>
          <Input
            id="costPerUnit"
            type="number"
            step="0.01"
            {...register("costPerUnit", { valueAsNumber: true })}
            placeholder="0.00"
          />
          <p className="text-xs text-gray-500 mt-1">Optional</p>
          {errors.costPerUnit && (
            <p className="text-sm text-red-500 mt-1">
              {errors.costPerUnit.message}
            </p>
          )}
        </div>
      </div>

      {/* Supplier */}
      <div>
        <Label htmlFor="supplierId">Supplier (Optional)</Label>
        <Select
          value={selectedSupplierId || undefined}
          onValueChange={(value) => setValue("supplierId", value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select supplier (optional)" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-gray-500">
                No suppliers available
              </div>
            ) : (
              suppliers.map((supplier: any) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          Leave empty for no supplier. Can be changed later.
        </p>
        {errors.supplierId && (
          <p className="text-sm text-red-500 mt-1">
            {errors.supplierId.message}
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : item ? "Update Item" : "Create Item"}
        </Button>
      </div>
    </form>
  )
}