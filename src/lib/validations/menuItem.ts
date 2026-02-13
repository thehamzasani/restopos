import { z } from "zod"

export const menuItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  price: z.coerce
    .number()
    .positive("Price must be positive")
    .multipleOf(0.01, "Price must have at most 2 decimal places"),
  categoryId: z.string().min(1, "Category is required"),
  image: z.string().optional(),
  isAvailable: z.boolean().default(true),
  preparationTime: z.coerce
    .number()
    .int()
    .positive("Preparation time must be positive")
    .optional(),
})

export type MenuItemInput = z.infer<typeof menuItemSchema>

export const menuItemUpdateSchema = menuItemSchema.partial()