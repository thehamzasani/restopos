// src/app/api/orders/route.ts
import { NextResponse } from "next/server"
// import { getServerSession } from "next-auth"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createOrderSchema } from "@/lib/validations/order"

// GET /api/orders - Get all orders with filters
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const orderType = searchParams.get("orderType")
    const paymentStatus = searchParams.get("paymentStatus")
    const search = searchParams.get("search")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = parseInt(searchParams.get("limit") || "50")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    const where: any = {}

    if (status) {
      const statuses = status.split(",")
      where.status = { in: statuses }
    }

    if (orderType) {
      const types = orderType.split(",")
      where.orderType = { in: types }
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
      ]
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.createdAt.lte = end
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          table: { select: { id: true, number: true } },
          user: { select: { id: true, name: true } },
          orderItems: {
            include: {
              menuItem: { select: { id: true, name: true, price: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("[GET /api/orders]", error)
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
  }
}

// POST /api/orders - Create new order
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createOrderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Validate table for DINE_IN
    if (data.orderType === "DINE_IN") {
      if (!data.tableId) {
        return NextResponse.json(
          { success: false, error: "Table is required for dine-in orders" },
          { status: 400 }
        )
      }
      const table = await prisma.table.findUnique({ where: { id: data.tableId } })
      if (!table) {
        return NextResponse.json({ success: false, error: "Table not found" }, { status: 404 })
      }
    }

    // Validate delivery address for DELIVERY
    if (data.orderType === "DELIVERY" && !data.deliveryAddress) {
      return NextResponse.json(
        { success: false, error: "Delivery address is required" },
        { status: 400 }
      )
    }

    // Fetch and validate menu items
    const menuItemIds = data.items.map((i) => i.menuItemId)
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, isAvailable: true },
    })

    if (menuItems.length !== menuItemIds.length) {
      return NextResponse.json(
        { success: false, error: "One or more menu items are unavailable" },
        { status: 400 }
      )
    }

    // Get settings for tax rate
    const settings = await prisma.settings.findFirst()
    const taxRate = settings ? Number(settings.taxRate) / 100 : 0.1

    // Calculate totals
    const itemsWithPrices = data.items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId)!
      const price = Number(menuItem.price)
      return {
        ...item,
        price,
        subtotal: price * item.quantity,
      }
    })

    const subtotal = itemsWithPrices.reduce((sum, i) => sum + i.subtotal, 0)
    const discountAmount = Math.min(data.discount ?? 0, subtotal)
    const taxableAmount = subtotal - discountAmount
    const tax = taxableAmount * taxRate
    const deliveryFee = data.orderType === "DELIVERY" ? (data.deliveryFee ?? 0) : 0
    const total = taxableAmount + tax + deliveryFee

    // Generate order number
    const orderCount = await prisma.order.count()
    const orderNumber = `ORD-${String(orderCount + 1).padStart(4, "0")}`

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          orderType: data.orderType,
          tableId: data.orderType === "DINE_IN" ? data.tableId : null,
          customerName: data.customerName ?? null,
          customerPhone: data.customerPhone ?? null,
          deliveryAddress: data.orderType === "DELIVERY" ? data.deliveryAddress : null,
          deliveryNote: data.orderType === "DELIVERY" ? (data.deliveryNote ?? null) : null,
          deliveryFee,
          userId: session.user.id,
          subtotal,
          tax: Math.round(tax * 100) / 100,
          discount: discountAmount,
          total: Math.round(total * 100) / 100,
          status: "PENDING",
          paymentMethod: data.paymentMethod ?? null,
          paymentStatus: data.paymentMethod ? "PAID" : "PENDING",
          notes: data.notes ?? null,
          orderItems: {
            create: itemsWithPrices.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: item.price,
              subtotal: Math.round(item.subtotal * 100) / 100,
              notes: item.notes ?? null,
            })),
          },
        },
        include: {
          table: { select: { id: true, number: true } },
          user: { select: { id: true, name: true } },
          orderItems: {
            include: { menuItem: { select: { id: true, name: true } } },
          },
        },
      })

      // Mark table as occupied for dine-in
      if (data.orderType === "DINE_IN" && data.tableId) {
        await tx.table.update({
          where: { id: data.tableId },
          data: { status: "OCCUPIED" },
        })
      }

      // Create transaction record if payment method given
      if (data.paymentMethod) {
        await tx.transaction.create({
          data: {
            orderId: newOrder.id,
            amount: Math.round(total * 100) / 100,
            method: data.paymentMethod,
          },
        })
      }

      return newOrder
    })

    return NextResponse.json({ success: true, data: order }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/orders]", error)
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
  }
}