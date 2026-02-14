import { z } from "zod"

export const orderItemSchema = z.object({
  menuItemId: z.string().min(1, "Menu item is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be positive"),
  notes: z.string().optional(),
})

export const createOrderSchema = z.object({
  orderType: z.enum(["DINE_IN", "TAKEAWAY"]),
  tableId: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
  discount: z.number().min(0).default(0),
  paymentMethod: z.enum(["CASH", "CARD", "UPI", "OTHER"]).optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type OrderItemInput = z.infer<typeof orderItemSchema>