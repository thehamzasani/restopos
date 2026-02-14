import { NextRequest, NextResponse } from "next/server"
import  getServerSession  from "next-auth"
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

    const orders = await prisma.order.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(orderType && { orderType: orderType as any }),
        ...(tableId && { tableId }),
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
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: orders,
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order OR add to existing order
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

    // Check if table already has an active order
    if (validatedData.tableId) {
      const existingOrder = await prisma.order.findFirst({
        where: {
          tableId: validatedData.tableId,
          status: {
            in: ["PENDING", "PREPARING", "READY"],
          },
        },
        include: {
          orderItems: true,
        },
      })

      // If table has active order, add items to existing order
      if (existingOrder) {
        // Calculate new items total
        const newItemsSubtotal = validatedData.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )
        const newItemsTax = newItemsSubtotal * 0.1

        // ✅ FIXED: Convert Decimal to number before adding
        const currentSubtotal = Number(existingOrder.subtotal)
        const currentTax = Number(existingOrder.tax)
        const currentTotal = Number(existingOrder.total)

        const updatedSubtotal = currentSubtotal + newItemsSubtotal
        const updatedTax = currentTax + newItemsTax
        const updatedTotal = currentTotal + newItemsSubtotal + newItemsTax

        // Update existing order
        const updatedOrder = await prisma.order.update({
          where: { id: existingOrder.id },
          data: {
            subtotal: updatedSubtotal,
            tax: updatedTax,
            total: updatedTotal,
            // Add new items
            orderItems: {
              create: validatedData.items.map((item) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity,
                notes: item.notes,
              })),
            },
          },
          include: {
            table: true,
            orderItems: {
              include: {
                menuItem: true,
              },
            },
          },
        })

        return NextResponse.json({
          success: true,
          data: updatedOrder,
          message: `Items added to existing order #${existingOrder.orderNumber}`,
          isUpdated: true,
        })
      }
    }

    // No existing order, create new order
    const orderCount = await prisma.order.count()
    const orderNumber = `ORD${String(orderCount + 1).padStart(6, "0")}`

    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    const tax = subtotal * 0.1
    const total = subtotal + tax - validatedData.discount

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
        status: "PENDING",
        paymentMethod: validatedData.paymentMethod,
        paymentStatus: validatedData.paymentMethod ? "PAID" : "PENDING",
        notes: validatedData.notes,
        orderItems: {
          create: validatedData.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
            notes: item.notes,
          })),
        },
      },
      include: {
        table: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    })

    // Set table status to OCCUPIED
    if (validatedData.tableId) {
      await prisma.table.update({
        where: { id: validatedData.tableId },
        data: { status: "OCCUPIED" },
      })
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: "Order created successfully",
      isUpdated: false,
    })
  } catch (error: any) {
    console.error("Error creating order:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    )
  }
}