// src/lib/validations/order.ts
import { z } from "zod"

export const orderItemSchema = z.object({
  menuItemId: z.string().min(1, "Menu item is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be positive"),
  notes: z.string().optional(),
})

export const createOrderSchema = z
  .object({
    orderType: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]),

    // Dine-in
    tableId: z.string().optional(),

    // Takeaway & Delivery
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),

    // Delivery only
    deliveryAddress: z.string().optional(),
    deliveryNote: z.string().optional(),
    deliveryFee: z.number().min(0).default(0),

    // Order items
    items: z.array(orderItemSchema).min(1, "At least one item is required"),

    // Pricing
    discount: z.number().min(0).default(0),
    notes: z.string().optional(),
    paymentMethod: z.enum(["CASH", "CARD", "UPI", "OTHER"]).optional(),
  })
  .refine(
    (data) => {
      // DINE_IN requires tableId
      if (data.orderType === "DINE_IN") {
        return !!data.tableId
      }
      return true
    },
    {
      message: "Table is required for dine-in orders",
      path: ["tableId"],
    }
  )
  .refine(
    (data) => {
      // DELIVERY requires deliveryAddress
      if (data.orderType === "DELIVERY") {
        return !!data.deliveryAddress && data.deliveryAddress.trim().length > 0
      }
      return true
    },
    {
      message: "Delivery address is required for delivery orders",
      path: ["deliveryAddress"],
    }
  )

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PREPARING", "READY", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"]),
})

export const applyDiscountSchema = z.object({
  discount: z.number().min(0, "Discount must be positive"),
  discountType: z.enum(["AMOUNT", "PERCENT"]),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type OrderItemInput = z.infer<typeof orderItemSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type ApplyDiscountInput = z.infer<typeof applyDiscountSchema>