// src/app/api/reports/sales/detailed/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, parseISO } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    const orderType = searchParams.get('orderType')
    const paymentMethod = searchParams.get('paymentMethod')
    const status = searchParams.get('status')

    let start: Date
    let end: Date

    if (startDateParam && endDateParam) {
      start = new Date(startDateParam)
      end = new Date(endDateParam)
    } else {
      start = startOfDay(new Date())
      end = endOfDay(new Date())
    }

    // Build filter
    const where: any = {
      createdAt: { gte: start, lte: end },
      status: status && status !== 'ALL' ? status : 'COMPLETED',
    }

    // ✅ Handle all order types including DELIVERY
    if (orderType && orderType !== 'ALL') {
      where.orderType = orderType
    }

    if (paymentMethod && paymentMethod !== 'ALL') {
      where.paymentMethod = paymentMethod
    }

    // Fetch orders with items
    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Format response — include all order type fields
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,  // ✅ returns DINE_IN, TAKEAWAY, or DELIVERY
      tableId: order.table?.number ?? null,
      customerName: order.customerName ?? null,
      customerPhone: order.customerPhone ?? null,
      deliveryAddress: order.deliveryAddress ?? null,  // ✅ added
      deliveryNote: order.deliveryNote ?? null,         // ✅ added
      deliveryFee: order.deliveryFee?.toString() ?? '0', // ✅ added
      total: order.total.toString(),
      subtotal: order.subtotal.toString(),
      tax: order.tax.toString(),
      discount: order.discount.toString(),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      itemCount: order.orderItems.length,
      items: order.orderItems.map(item => ({
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.price.toString(),
        subtotal: item.subtotal.toString(),
      })),
    }))

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0)

    return NextResponse.json({
      success: true,
      data: {
        orders: formattedOrders,
        total: orders.length,
        totalRevenue: totalRevenue.toFixed(2),
        summary: {
          totalRevenue: totalRevenue.toFixed(2),
          totalOrders: orders.length,
        },
      },
    })
  } catch (error) {
    console.error('[Detailed Sales] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch detailed sales report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}