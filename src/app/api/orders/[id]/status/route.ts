// src/app/api/orders/[id]/status/route.ts

import { NextRequest, NextResponse } from "next/server"
import  getServerSession from "next-auth"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateOrderStatusSchema } from "@/lib/validations/order"
import { deductInventoryForOrder } from "@/lib/inventory-deduction"

export async function PATCH(
  req: NextRequest,
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

    const body = await req.json()

    // Validate input
    const validationResult = updateOrderStatusSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const { status } = validationResult.data

    // Get current order
    const currentOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        table: true,
      },
    })

    if (!currentOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    // ✅ NEW: Auto-deduct inventory when status changes to COMPLETED
    if (status === "COMPLETED" && currentOrder.status !== "COMPLETED") {
      const deductionResult = await deductInventoryForOrder(params.id)

      if (!deductionResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: deductionResult.message,
            insufficientItems: deductionResult.insufficientItems,
          },
          { status: 400 }
        )
      }
    }

    // Update order status
    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        table: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    })

    // If order is completed and has a table, set table to AVAILABLE
    if (status === "COMPLETED" && order.tableId) {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: "AVAILABLE" },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        discount: Number(order.discount),
        total: Number(order.total),
      },
      message: "Order status updated successfully",
    })
  } catch (error) {
    console.error("Update order status error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update order status" },
      { status: 500 }
    )
  }
}