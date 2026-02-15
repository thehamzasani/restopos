// src/lib/validations/inventory.ts

import { z } from "zod"

// Inventory validation schema
export const inventorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().optional(),
  quantity: z.number().min(0, "Quantity cannot be negative"),
  unit: z.string().min(1, "Unit is required").max(20, "Unit is too long"),
  lowStockThreshold: z.number().min(0, "Threshold cannot be negative"),
  costPerUnit: z.number().min(0, "Cost cannot be negative").optional(),
  supplierId: z.string().optional(),
})

// Stock adjustment schema
export const stockAdjustmentSchema = z.object({
  quantity: z.number(),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  reason: z.string().optional(),
})

// Supplier validation schema
export const supplierSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  contact: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export type InventoryInput = z.infer<typeof inventorySchema>
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>
export type SupplierInput = z.infer<typeof supplierSchema>