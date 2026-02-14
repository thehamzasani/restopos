import { NextRequest, NextResponse } from "next/server"
import  getServerSession  from "next-auth"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/orders/[id] - Get single order
export async function GET(
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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
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
            menuItem: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] - Cancel order
export async function DELETE(
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

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
    })

    // If table order, update table status back to AVAILABLE
    if (order.tableId) {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: "AVAILABLE" },
      })
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: "Order cancelled successfully",
    })
  } catch (error: any) {
    console.error("Error cancelling order:", error)

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to cancel order" },
      { status: 500 }
    )
  }
}