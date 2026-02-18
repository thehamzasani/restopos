// src/app/api/orders/[id]/status/route.ts
import { NextResponse } from "next/server"
// import { getServerSession } from "next-auth"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateOrderStatusSchema } from "@/lib/validations/order"

// PUT /api/orders/[id]/status - Update order status
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = updateOrderStatusSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid status", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { status } = parsed.data

    // Find the existing order
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: { table: true },
    })

    if (!existingOrder) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    // Update order and handle side effects
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: params.id },
        data: { status },
        include: {
          table: { select: { id: true, number: true } },
          user: { select: { id: true, name: true } },
          orderItems: {
            include: { menuItem: { select: { id: true, name: true } } },
          },
        },
      })

      // Free up table when dine-in order is completed or cancelled
      if (
        existingOrder.orderType === "DINE_IN" &&
        existingOrder.tableId &&
        (status === "COMPLETED" || status === "CANCELLED")
      ) {
        // Check if table has other active orders
        const activeOrders = await tx.order.count({
          where: {
            tableId: existingOrder.tableId,
            id: { not: params.id },
            status: { notIn: ["COMPLETED", "CANCELLED"] },
          },
        })

        if (activeOrders === 0) {
          await tx.table.update({
            where: { id: existingOrder.tableId },
            data: { status: "AVAILABLE" },
          })
        }
      }

      // Auto-deduct inventory on COMPLETED
      if (status === "COMPLETED" && existingOrder.status !== "COMPLETED") {
        const orderItems = await tx.orderItem.findMany({
          where: { orderId: params.id },
          include: {
            menuItem: {
              include: {
                ingredients: { include: { inventory: true } },
              },
            },
          },
        })

        for (const orderItem of orderItems) {
          for (const ingredient of orderItem.menuItem.ingredients) {
            const deductAmount = Number(ingredient.quantityUsed) * orderItem.quantity
            const currentQty = Number(ingredient.inventory.quantity)
            const newQty = Math.max(0, currentQty - deductAmount)

            await tx.inventory.update({
              where: { id: ingredient.inventoryId },
              data: { quantity: newQty },
            })

            await tx.stockHistory.create({
              data: {
                inventoryId: ingredient.inventoryId,
                quantity: deductAmount,
                type: "OUT",
                reason: `Auto-deducted for Order #${existingOrder.orderNumber}`,
              },
            })
          }
        }
      }

      return order
    })

    return NextResponse.json({ success: true, data: updatedOrder })
  } catch (error) {
    console.error("[PUT /api/orders/[id]/status]", error)
    return NextResponse.json({ success: false, error: "Failed to update order status" }, { status: 500 })
  }
}