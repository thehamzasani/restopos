import { z } from "zod"

export const tableSchema = z.object({
  number: z.number().int().min(1, "Table number must be at least 1"),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  status: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED"]).default("AVAILABLE"),
})

export type TableInput = z.infer<typeof tableSchema>

export const tableUpdateSchema = tableSchema.partial()