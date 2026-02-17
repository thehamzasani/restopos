// src/lib/validations/settings.ts

import { z } from "zod"
import { UserRole } from "@prisma/client"

// Restaurant Settings Validation
export const restaurantSettingsSchema = z.object({
  restaurantName: z.string().min(1, "Restaurant name is required").max(100),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  currency: z.string().min(1, "Currency is required").max(10),
  receiptHeader: z.string().optional().nullable(),
  receiptFooter: z.string().optional().nullable(),
})

export type RestaurantSettingsInput = z.infer<typeof restaurantSettingsSchema>

// Tax Settings Validation
export const taxSettingsSchema = z.object({
  taxRate: z.coerce
    .number()
    .min(0, "Tax rate must be at least 0")
    .max(100, "Tax rate must be at most 100"),
})

export type TaxSettingsInput = z.infer<typeof taxSettingsSchema>

// User Validation
export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean().default(true),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  email: z.string().email("Invalid email").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

// Table Validation
export const createTableSchema = z.object({
  number: z.coerce.number().int().min(1, "Table number must be at least 1"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
})

export type CreateTableInput = z.infer<typeof createTableSchema>

export const updateTableSchema = z.object({
  number: z.coerce.number().int().min(1, "Table number must be at least 1").optional(),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1").optional(),
  status: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED"]).optional(),
})

export type UpdateTableInput = z.infer<typeof updateTableSchema>