import { z } from "zod"

// Existing create order schema
export const createOrderSchema = z.object({
  orderType: z.enum(["DINE_IN", "TAKEAWAY"]),
  tableId: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string(),
        quantity: z.number().min(1),
        price: z.number().min(0),
        notes: z.string().optional(),
      })
    )
    .min(1, "At least one item is required"),
  notes: z.string().optional(),
  discount: z.number().min(0).default(0),
  paymentMethod: z.enum(["CASH", "CARD", "UPI", "OTHER"]),
})

// ✅ NEW: Update order status schema
export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"]),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>