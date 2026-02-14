import { NextRequest, NextResponse } from "next/server"
import getServerSession from "next-auth"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateOrderStatusSchema } from "@/lib/validations/order"

// PUT /api/orders/[id]/status - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status } = updateOrderStatusSchema.parse(body)

    // Get existing order
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: { table: true },
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        // Auto-set payment status to PAID when completed
        paymentStatus: status === "COMPLETED" ? "PAID" : existingOrder.paymentStatus,
      },
      include: {
        table: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                image: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // ✅ IMPORTANT: Auto-update table status when order is completed
    if (status === "COMPLETED" && existingOrder.tableId) {
      await prisma.table.update({
        where: { id: existingOrder.tableId },
        data: { status: "AVAILABLE" },
      })
    }

    // ✅ Auto-update table status when order is cancelled
    if (status === "CANCELLED" && existingOrder.tableId) {
      // Check if there are any other active orders for this table
      const activeOrdersCount = await prisma.order.count({
        where: {
          tableId: existingOrder.tableId,
          id: { not: params.id },
          status: { in: ["PENDING", "PREPARING", "READY"] },
        },
      })

      // If no other active orders, set table to AVAILABLE
      if (activeOrdersCount === 0) {
        await prisma.table.update({
          where: { id: existingOrder.tableId },
          data: { status: "AVAILABLE" },
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: `Order status updated to ${status}`,
    })
  } catch (error: any) {
    console.error("Error updating order status:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to update order status" },
      { status: 500 }
    )
  }
}