import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
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

    const orderId = params.id

    // Fetch order with all details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        user: true,
        table: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    // Fetch restaurant settings
    const settings = await prisma.settings.findFirst()

    // Format receipt data
    const receiptData = {
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      tableNumber: order.table?.number,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      date: order.createdAt,
      cashierName: order.user.name,
      items: order.orderItems.map((item) => ({
        name: item.menuItem.name,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.subtotal),
        notes: item.notes,
      })),
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      discount: Number(order.discount),
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      // Calculate change if cash payment
      change:
        order.paymentMethod === "CASH"
          ? 0 // You can add cash received field to calculate change
          : undefined,
    }

    const restaurantInfo = {
      name: settings?.restaurantName || "Restaurant Name",
      address: settings?.address || undefined,
      phone: settings?.phone || undefined,
      email: settings?.email || undefined,
      receiptHeader: settings?.receiptHeader || undefined,
      receiptFooter: settings?.receiptFooter || undefined,
    }

    return NextResponse.json({
      success: true,
      data: {
        receipt: receiptData,
        restaurant: restaurantInfo,
      },
    })
  } catch (error: any) {
    console.error("Error generating receipt:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate receipt" },
      { status: 500 }
    )
  }
}