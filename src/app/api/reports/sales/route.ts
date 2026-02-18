// src/app/api/reports/sales/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    const orderType = searchParams.get("orderType")

    // Helper to format date as YYYY-MM-DD without timezone shift
    const toDateKey = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    // Build date range
    let startDate: Date
    let endDate: Date

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(endDateParam)
      endDate.setHours(23, 59, 59, 999)
    } else {
      const now = new Date()
      startDate = new Date()
      endDate = new Date()
      endDate.setHours(23, 59, 59, 999)

      switch (period) {
        case "today":
          startDate.setHours(0, 0, 0, 0)
          break
        case "yesterday":
          startDate = new Date(now)
          startDate.setDate(now.getDate() - 1)
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(now)
          endDate.setDate(now.getDate() - 1)
          endDate.setHours(23, 59, 59, 999)
          break
        case "week":
          startDate = new Date(now)
          startDate.setDate(now.getDate() - 6)  // -6 so today is included = 7 days
          startDate.setHours(0, 0, 0, 0)
          break
        case "month":
          startDate = new Date(now)
          startDate.setDate(now.getDate() - 29) // -29 so today is included = 30 days
          startDate.setHours(0, 0, 0, 0)
          break
        case "3months":
          startDate = new Date(now)
          startDate.setDate(now.getDate() - 89) // -89 so today is included = 90 days
          startDate.setHours(0, 0, 0, 0)
          break
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1)
          startDate.setHours(0, 0, 0, 0)
          break
        default:
          startDate.setHours(0, 0, 0, 0)
      }
    }

    const baseWhere: any = {
      createdAt: { gte: startDate, lte: endDate },
      status: "COMPLETED",
    }

    if (orderType) {
      baseWhere.orderType = orderType
    }

    // Fetch all orders for the period
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

    // Revenue trend by day (raw SQL)
    const revenueTrend = await prisma.$queryRaw`
      SELECT
        DATE("createdAt") as date,
        SUM(CASE WHEN "orderType" = 'DINE_IN' THEN total ELSE 0 END) as dine_in,
        SUM(CASE WHEN "orderType" = 'TAKEAWAY' THEN total ELSE 0 END) as takeaway,
        SUM(CASE WHEN "orderType" = 'DELIVERY' THEN total ELSE 0 END) as delivery,
        SUM(total) as total,
        COUNT(*) as count
      FROM "public"."Order"
      WHERE "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
        AND status::text = 'COMPLETED'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `

    // Generate ALL dates in range (local time, no timezone shift)
    const allDates: string[] = []
    const current = new Date(startDate)
    current.setHours(0, 0, 0, 0)
    const endCopy = new Date(endDate)
    endCopy.setHours(0, 0, 0, 0)

    while (current <= endCopy) {
      allDates.push(toDateKey(current))
      current.setDate(current.getDate() + 1)
    }

    // Map raw trend rows by date (fix timezone shift with local date formatting)
    const trendMap = new Map(
      (revenueTrend as any[]).map(row => {
        const d = new Date(row.date)
        // Use UTC date parts to avoid timezone shift from PostgreSQL DATE type
        const dateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
        return [
          dateKey,
          {
            dine_in: Number(row.dine_in),
            takeaway: Number(row.takeaway),
            delivery: Number(row.delivery),
            total: Number(row.total),
            count: Number(row.count),
          }
        ]
      })
    )

    // Fill all dates with 0 for missing days
    const serializedTrend = allDates.map(date => ({
      date,
      dine_in: trendMap.get(date)?.dine_in ?? 0,
      takeaway: trendMap.get(date)?.takeaway ?? 0,
      delivery: trendMap.get(date)?.delivery ?? 0,
      total: trendMap.get(date)?.total ?? 0,
      count: trendMap.get(date)?.count ?? 0,
    }))

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
        revenueTrend: serializedTrend,
        period: { startDate, endDate },
      },
    })
  } catch (error) {
    console.error("[GET /api/reports/sales]", error)
    return NextResponse.json({ success: false, error: "Failed to fetch sales report" }, { status: 500 })
  }
}