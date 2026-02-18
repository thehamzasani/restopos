// src/app/api/reports/sales/route.ts
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/reports/sales - Get sales analytics
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") ?? "today"
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")
    const orderType = searchParams.get("orderType") // "DINE_IN" | "TAKEAWAY" | "DELIVERY" | null

    // Build date range
    let startDate: Date
    let endDate: Date = new Date()
    endDate.setHours(23, 59, 59, 999)

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam)
      endDate = new Date(endDateParam)
      endDate.setHours(23, 59, 59, 999)
    } else {
      startDate = new Date()
      switch (period) {
        case "today":
          startDate.setHours(0, 0, 0, 0)
          break
        case "week":
          startDate.setDate(startDate.getDate() - 7)
          startDate.setHours(0, 0, 0, 0)
          break
        case "month":
          startDate.setDate(1)
          startDate.setHours(0, 0, 0, 0)
          break
        case "year":
          startDate = new Date(startDate.getFullYear(), 0, 1)
          break
        default:
          startDate.setHours(0, 0, 0, 0)
      }
    }

    const baseWhere: any = {
      createdAt: { gte: startDate, lte: endDate },
      status: { not: "CANCELLED" },
    }

    if (orderType) {
      baseWhere.orderType = orderType
    }

    // Fetch all completed/paid orders for the period
    const orders = await prisma.order.findMany({
      where: baseWhere,
      select: {
        id: true,
        orderType: true,
        subtotal: true,
        tax: true,
        discount: true,
        deliveryFee: true,
        total: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        createdAt: true,
      },
    })

    // Summary stats by order type
    const dineInOrders = orders.filter((o) => o.orderType === "DINE_IN")
    const takeawayOrders = orders.filter((o) => o.orderType === "TAKEAWAY")
    const deliveryOrders = orders.filter((o) => o.orderType === "DELIVERY")

    const sumTotal = (arr: typeof orders) =>
      arr.reduce((sum, o) => sum + Number(o.total), 0)

    const totalRevenue = sumTotal(orders)
    const totalOrders = orders.length

    // Payment method breakdown
    const paymentBreakdown = orders.reduce(
      (acc, o) => {
        if (o.paymentMethod) {
          acc[o.paymentMethod] = (acc[o.paymentMethod] ?? 0) + Number(o.total)
        }
        return acc
      },
      {} as Record<string, number>
    )

    // Revenue trend by day (for charts)
    const revenueTrend = await prisma.$queryRaw`
      SELECT
        DATE("createdAt") as date,
        SUM(CASE WHEN "orderType" = 'DINE_IN' THEN total ELSE 0 END) as dine_in,
        SUM(CASE WHEN "orderType" = 'TAKEAWAY' THEN total ELSE 0 END) as takeaway,
        SUM(CASE WHEN "orderType" = 'DELIVERY' THEN total ELSE 0 END) as delivery,
        SUM(total) as total,
        COUNT(*) as count
      FROM "Order"
      WHERE "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
        AND status != 'CANCELLED'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `

    // Discount analytics
    const totalDiscount = orders.reduce((sum, o) => sum + Number(o.discount), 0)
    const ordersWithDiscount = orders.filter((o) => Number(o.discount) > 0).length

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalOrders,
          averageOrderValue: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
          totalDiscount: Math.round(totalDiscount * 100) / 100,
          ordersWithDiscount,
          // By type
          dineIn: {
            orders: dineInOrders.length,
            revenue: Math.round(sumTotal(dineInOrders) * 100) / 100,
          },
          takeaway: {
            orders: takeawayOrders.length,
            revenue: Math.round(sumTotal(takeawayOrders) * 100) / 100,
          },
          delivery: {
            orders: deliveryOrders.length,
            revenue: Math.round(sumTotal(deliveryOrders) * 100) / 100,
            deliveryFees: Math.round(
              deliveryOrders.reduce((sum, o) => sum + Number(o.deliveryFee), 0) * 100
            ) / 100,
          },
        },
        paymentBreakdown,
        revenueTrend,
        period: { startDate, endDate },
      },
    })
  } catch (error) {
    console.error("[GET /api/reports/sales]", error)
    return NextResponse.json({ success: false, error: "Failed to fetch sales report" }, { status: 500 })
  }
}