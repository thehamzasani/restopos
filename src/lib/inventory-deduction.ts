// src/lib/inventory-deduction.ts

import { prisma } from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"

interface DeductionResult {
  success: boolean
  message: string
  insufficientItems?: {
    itemName: string
    required: number
    available: number
    unit: string
  }[]
}

/**
 * Auto-deduct inventory when order is completed
 * Called when order status changes to COMPLETED
 */
export async function deductInventoryForOrder(
  orderId: string
): Promise<DeductionResult> {
  try {
    // Get order with items and their ingredients
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            menuItem: {
              include: {
                ingredients: {
                  include: {
                    inventory: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!order) {
      return {
        success: false,
        message: "Order not found",
      }
    }

    // Check if already completed (prevent double deduction)
    if (order.status === "COMPLETED") {
      return {
        success: false,
        message: "Order already completed and stock already deducted",
      }
    }

    // Collect all inventory deductions needed
    const deductions: Map<
      string,
      {
        inventoryId: string
        name: string
        currentQty: Decimal
        requiredQty: number
        unit: string
      }
    > = new Map()

    // Calculate total deductions
    for (const orderItem of order.orderItems) {
      const { menuItem, quantity } = orderItem

      for (const ingredient of menuItem.ingredients) {
        const key = ingredient.inventoryId
        const requiredForThisItem =
          Number(ingredient.quantityUsed) * quantity

        if (deductions.has(key)) {
          const existing = deductions.get(key)!
          existing.requiredQty += requiredForThisItem
        } else {
          deductions.set(key, {
            inventoryId: ingredient.inventoryId,
            name: ingredient.inventory.name,
            currentQty: ingredient.inventory.quantity,
            requiredQty: requiredForThisItem,
            unit: ingredient.inventory.unit,
          })
        }
      }
    }

    // Check for insufficient stock
    const insufficientItems: DeductionResult["insufficientItems"] = []

    for (const [, deduction] of deductions) {
      const currentQty = Number(deduction.currentQty)
      if (currentQty < deduction.requiredQty) {
        insufficientItems.push({
          itemName: deduction.name,
          required: deduction.requiredQty,
          available: currentQty,
          unit: deduction.unit,
        })
      }
    }

    // If insufficient stock, return error
    if (insufficientItems.length > 0) {
      return {
        success: false,
        message: "Insufficient stock for some items",
        insufficientItems,
      }
    }

    // Perform deductions in a transaction
    await prisma.$transaction(async (tx) => {
      for (const [, deduction] of deductions) {
        // Deduct from inventory
        await tx.inventory.update({
          where: { id: deduction.inventoryId },
          data: {
            quantity: {
              decrement: deduction.requiredQty,
            },
          },
        })

        // Log in stock history
        await tx.stockHistory.create({
          data: {
            inventoryId: deduction.inventoryId,
            quantity: new Decimal(deduction.requiredQty),
            type: "OUT",
            reason: `Auto-deducted for order #${order.orderNumber}`,
          },
        })
      }
    })

    return {
      success: true,
      message: `Successfully deducted inventory for order #${order.orderNumber}`,
    }
  } catch (error) {
    console.error("Inventory deduction error:", error)
    return {
      success: false,
      message: "Failed to deduct inventory",
    }
  }
}

/**
 * Check if order has sufficient inventory before completing
 */
export async function checkInventoryAvailability(
  orderId: string
): Promise<DeductionResult> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            menuItem: {
              include: {
                ingredients: {
                  include: {
                    inventory: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!order) {
      return {
        success: false,
        message: "Order not found",
      }
    }

    // Calculate required quantities
    const requirements: Map<
      string,
      {
        name: string
        currentQty: Decimal
        requiredQty: number
        unit: string
      }
    > = new Map()

    for (const orderItem of order.orderItems) {
      for (const ingredient of orderItem.menuItem.ingredients) {
        const key = ingredient.inventoryId
        const requiredForThisItem =
          Number(ingredient.quantityUsed) * orderItem.quantity

        if (requirements.has(key)) {
          const existing = requirements.get(key)!
          existing.requiredQty += requiredForThisItem
        } else {
          requirements.set(key, {
            name: ingredient.inventory.name,
            currentQty: ingredient.inventory.quantity,
            requiredQty: requiredForThisItem,
            unit: ingredient.inventory.unit,
          })
        }
      }
    }

    // Check availability
    const insufficientItems: DeductionResult["insufficientItems"] = []

    for (const [, req] of requirements) {
      const currentQty = Number(req.currentQty)
      if (currentQty < req.requiredQty) {
        insufficientItems.push({
          itemName: req.name,
          required: req.requiredQty,
          available: currentQty,
          unit: req.unit,
        })
      }
    }

    if (insufficientItems.length > 0) {
      return {
        success: false,
        message: "Insufficient stock",
        insufficientItems,
      }
    }

    return {
      success: true,
      message: "Sufficient stock available",
    }
  } catch (error) {
    console.error("Inventory check error:", error)
    return {
      success: false,
      message: "Failed to check inventory",
    }
  }
}