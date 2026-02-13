import { z } from "zod"

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Name too long"),
  description: z.string().max(200, "Description too long").optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
})

export type CategoryInput = z.infer<typeof categorySchema>

export const categoryUpdateSchema = categorySchema.partial()