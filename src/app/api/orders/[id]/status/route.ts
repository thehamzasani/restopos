import { NextResponse } from "next/server"
import getServerSession from "next-auth"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateOrderStatusSchema } from "@/lib/validations/order"

// PATCH /api/orders/[id]/status - Update order status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateOrderStatusSchema.parse(body)

    // Get the order first
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { table: true },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: validatedData.status,
        // Auto-update payment status when completed
        ...(validatedData.status === "COMPLETED" && {
          paymentStatus: "PAID",
        }),
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        table: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Update table status based on order status
    if (order.tableId) {
      if (validatedData.status === "COMPLETED" || validatedData.status === "CANCELLED") {
        // Check if there are any other active orders for this table
        const activeOrders = await prisma.order.findMany({
          where: {
            tableId: order.tableId,
            id: { not: params.id },
            status: { in: ["PENDING", "PREPARING", "READY"] },
          },
        })

        // If no other active orders, set table to AVAILABLE
        if (activeOrders.length === 0) {
          await prisma.table.update({
            where: { id: order.tableId },
            data: { status: "AVAILABLE" },
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: `Order status updated to ${validatedData.status}`,
    })
  } catch (error: any) {
    console.error("Error updating order status:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order status" },
      { status: 500 }
    )
  }
}