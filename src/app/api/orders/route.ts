import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createOrderSchema } from "@/lib/validations/order"

// GET /api/orders - Get all orders
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const orderType = searchParams.get("orderType")
    const tableId = searchParams.get("tableId")
    const paymentStatus = searchParams.get("paymentStatus")
    const search = searchParams.get("search")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build where clause
    const where: any = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (orderType && orderType !== "all") {
      where.orderType = orderType
    }

    if (tableId) {
      where.tableId = tableId
    }

    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = paymentStatus
    }

    if (search) {
      where.orderNumber = {
        contains: search,
        mode: "insensitive",
      }
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        table: {
          select: { id: true, number: true },
        },
        user: {
          select: { id: true, name: true },
        },
        orderItems: {
          select: { id: true, quantity: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Serialize Decimal fields to numbers
    const serializedOrders = orders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      discount: Number(order.discount),
      total: Number(order.total),
    }))

    return NextResponse.json({ success: true, data: serializedOrders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createOrderSchema.parse(body)

    // ✅ Get tax rate from settings (not hardcoded!)
    const settings = await prisma.settings.findFirst()
    const taxRate = Number(settings?.taxRate ?? 10) // fallback to 10 if no settings

    // Calculate subtotal from items
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // ✅ Use tax rate from settings
    const tax = (subtotal * taxRate) / 100
    const total = subtotal + tax - validatedData.discount

    // Generate order number
    const orderCount = await prisma.order.count()
    const orderNumber = `ORD${String(orderCount + 1).padStart(6, "0")}`

    // Check if table already has an active order (dine-in)
    if (validatedData.orderType === "DINE_IN" && validatedData.tableId) {
      const existingOrder = await prisma.order.findFirst({
        where: {
          tableId: validatedData.tableId,
          status: { in: ["PENDING", "PREPARING", "READY"] },
        },
      })

      if (existingOrder) {
        // Add items to existing order
        const existingSubtotal = Number(existingOrder.subtotal)
        const newSubtotal = existingSubtotal + subtotal
        // ✅ Use tax rate from settings for existing order update too
        const newTax = (newSubtotal * taxRate) / 100
        const newTotal = newSubtotal + newTax - validatedData.discount

        const updatedOrder = await prisma.order.update({
          where: { id: existingOrder.id },
          data: {
            subtotal: newSubtotal,
            tax: newTax,
            total: newTotal,
            orderItems: {
              createMany: {
                data: validatedData.items.map((item) => ({
                  menuItemId: item.menuItemId,
                  quantity: item.quantity,
                  price: item.price,
                  subtotal: item.price * item.quantity,
                  notes: item.notes,
                })),
              },
            },
          },
          include: {
            orderItems: { include: { menuItem: true } },
            table: true,
            user: true,
          },
        })

        return NextResponse.json({
          success: true,
          data: updatedOrder,
          isUpdated: true,
          message: `Items added to existing order ${existingOrder.orderNumber}`,
        })
      }
    }

    // Create new order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        orderType: validatedData.orderType,
        tableId: validatedData.tableId,
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        userId: session.user.id,
        subtotal,
        tax,
        discount: validatedData.discount,
        total,
        notes: validatedData.notes,
        status: "PENDING",
        paymentMethod: validatedData.paymentMethod,
        paymentStatus: validatedData.paymentMethod ? "PAID" : "PENDING",
        orderItems: {
          createMany: {
            data: validatedData.items.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.price * item.quantity,
              notes: item.notes,
            })),
          },
        },
      },
      include: {
        orderItems: { include: { menuItem: true } },
        table: true,
        user: true,
      },
    })

    // Update table status to OCCUPIED for dine-in
    if (validatedData.tableId) {
      await prisma.table.update({
        where: { id: validatedData.tableId },
        data: { status: "OCCUPIED" },
      })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error: any) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    )
  }
}