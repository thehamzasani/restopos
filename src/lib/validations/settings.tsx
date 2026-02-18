// src/lib/validations/settings.ts
import { z } from "zod"

export const restaurantSettingsSchema = z.object({
  restaurantName: z
    .string()
    .min(1, "Restaurant name is required")
    .max(100, "Name must be less than 100 characters"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  currency: z.string().max(10, "Currency code too long").default("USD"),
  receiptHeader: z.string().optional(),
  receiptFooter: z.string().optional(),
})

export const taxSettingsSchema = z.object({
  taxRate: z
    .number()
    .min(0, "Tax rate must be 0 or greater")
    .max(100, "Tax rate cannot exceed 100%"),
})

export const deliverySettingsSchema = z.object({
  deliveryFee: z
    .number()
    .min(0, "Delivery fee must be 0 or greater"),
  minOrderAmount: z
    .number()
    .min(0, "Minimum order amount must be 0 or greater"),
})

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "MANAGER", "CASHIER", "KITCHEN"]),
   isActive: z.boolean().default(true),
})
export const editUserSchema = createUserSchema.extend({
  password: z.string().min(6).optional().or(z.literal("")),
})


export type EditUserInput = z.infer<typeof editUserSchema>
export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  role: z.enum(["ADMIN", "MANAGER", "CASHIER", "KITCHEN"]),
  isActive: z.boolean(),
  password: z.string().min(6).optional().or(z.literal("")),
})

export const createTableSchema = z.object({
  number: z.number().int().positive("Table number must be positive"),
  capacity: z.number().int().positive("Capacity must be positive"),
})

export const updateTableSchema = z.object({
  number: z.number().int().positive("Table number must be positive"),
  capacity: z.number().int().positive("Capacity must be positive"),
  status: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED"]),
})

export type RestaurantSettingsInput = z.infer<typeof restaurantSettingsSchema>
export type TaxSettingsInput = z.infer<typeof taxSettingsSchema>
export type DeliverySettingsInput = z.infer<typeof deliverySettingsSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateTableInput = z.infer<typeof createTableSchema>
export type UpdateTableInput = z.infer<typeof updateTableSchema>