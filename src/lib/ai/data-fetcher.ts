import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, subDays } from "date-fns"
import type { Intent, IntentResult } from "./intent-classifier"

function parseDateRange(params: Record<string, any>) {
  const now = new Date()
  let start: Date
  let end: Date

  if (params.start && params.end) {
    start = new Date(params.start)
    end = new Date(params.end)
  } else {
    const period = params.period || "today"
    end = endOfDay(now)

    switch (period) {
      case "today":
        start = startOfDay(now)
        break
      case "yesterday": {
        const y = subDays(now, 1)
        start = startOfDay(y)
        end = endOfDay(y)
        break
      }
      case "week":
        start = startOfDay(subDays(now, 6))
        break
      case "month":
        start = startOfDay(subDays(now, 29))
        break
      case "3months":
        start = startOfDay(subDays(now, 89))
        break
      case "all":
        start = new Date(2024, 0, 1)
        end = new Date(2099, 11, 31)
        break
      default:
        start = startOfDay(now)
    }
  }

  return { start, end }
}

async function fetchSalesSummary(start: Date, end: Date) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      status: "COMPLETED",
    },
    select: {
      id: true,
      orderType: true,
      total: true,
      subtotal: true,
      discount: true,
      deliveryFee: true,
      paymentMethod: true,
      createdAt: true,
    },
  })

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0)
  const totalOrders = orders.length

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    averageOrderValue: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
    totalDiscount: Math.round(orders.reduce((s, o) => s + Number(o.discount), 0) * 100) / 100,
    dineIn: orders.filter((o) => o.orderType === "DINE_IN").length,
    takeaway: orders.filter((o) => o.orderType === "TAKEAWAY").length,
    delivery: orders.filter((o) => o.orderType === "DELIVERY").length,
    paymentMethods: Object.fromEntries(
      orders.reduce((acc, o) => {
        if (o.paymentMethod) acc.set(o.paymentMethod, (acc.get(o.paymentMethod) || 0) + 1)
        return acc
      }, new Map<string, number>()),
    ),
    orders,
  }
}

async function fetchTopItems(start: Date, end: Date, limit: number = 5) {
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: { gte: start, lte: end },
        status: { in: ["COMPLETED", "READY"] },
        paymentStatus: "PAID",
      },
    },
    include: {
      menuItem: {
        select: { id: true, name: true, price: true },
      },
    },
  })

  const stats: Record<string, { name: string; quantity: number; revenue: number; count: number }> = {}

  for (const item of orderItems) {
    if (!stats[item.menuItemId]) {
      stats[item.menuItemId] = {
        name: item.menuItem.name,
        quantity: 0,
        revenue: 0,
        count: 0,
      }
    }
    stats[item.menuItemId].quantity += item.quantity
    stats[item.menuItemId].revenue += Number(item.subtotal)
    stats[item.menuItemId].count++
  }

  const items = Object.values(stats).map((s) => ({
    ...s,
    revenue: Math.round(s.revenue * 100) / 100,
    avgPrice: Math.round((s.revenue / s.count) * 100) / 100,
  }))

  return items.sort((a, b) => b.revenue - a.revenue).slice(0, limit)
}

async function fetchBottomItems(start: Date, end: Date, limit: number = 5) {
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: { gte: start, lte: end },
        status: { in: ["COMPLETED", "READY"] },
        paymentStatus: "PAID",
      },
    },
    include: {
      menuItem: {
        select: { id: true, name: true, price: true, categoryId: true },
      },
    },
  })

  const stats: Record<string, { name: string; quantity: number; revenue: number }> = {}

  for (const item of orderItems) {
    if (!stats[item.menuItemId]) {
      stats[item.menuItemId] = { name: item.menuItem.name, quantity: 0, revenue: 0 }
    }
    stats[item.menuItemId].quantity += item.quantity
    stats[item.menuItemId].revenue += Number(item.subtotal)
  }

  const allItems = Object.values(stats).map((s) => ({
    ...s,
    revenue: Math.round(s.revenue * 100) / 100,
  }))

  return allItems.sort((a, b) => a.revenue - b.revenue).slice(0, limit)
}

async function fetchRevenueTrend(start: Date, end: Date) {
  const trend = await prisma.$queryRaw<Array<{ date: Date; total: number; count: bigint }>>`
    SELECT
      DATE("createdAt") as date,
      SUM(total) as total,
      COUNT(*)::int as count
    FROM "public"."Order"
    WHERE "createdAt" >= ${start}
      AND "createdAt" <= ${end}
      AND status = 'COMPLETED'
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `

  return trend.map((row) => ({
    date: row.date instanceof Date ? row.date.toISOString().split("T")[0] : String(row.date),
    total: Number(row.total),
    count: Number(row.count),
  }))
}

async function fetchLowStock() {
  const items = await prisma.inventory.findMany({
    where: {
      quantity: { lte: prisma.inventory.fields.lowStockThreshold },
    },
    select: {
      id: true,
      name: true,
      quantity: true,
      unit: true,
      lowStockThreshold: true,
      description: true,
      supplier: { select: { id: true, name: true } },
    },
    orderBy: { quantity: "asc" },
  })

  return items.map((item) => ({
    ...item,
    quantity: Number(item.quantity),
    lowStockThreshold: Number(item.lowStockThreshold),
  }))
}

async function fetchAllMenuItems() {
  return prisma.menuItem.findMany({
    select: { id: true, name: true, price: true, categoryId: true, isAvailable: true },
    orderBy: { name: "asc" },
  })
}

export async function fetchDataForIntent(intent: Intent, params: Record<string, any>) {
  const range = parseDateRange(params)

  switch (intent) {
    case "daily_sales":
    case "period_sales": {
      const summary = await fetchSalesSummary(range.start, range.end)
      const trend = await fetchRevenueTrend(range.start, range.end)
      return { summary, trend }
    }

    case "top_items": {
      const items = await fetchTopItems(range.start, range.end, params.limit || 5)
      return { topItems: items }
    }

    case "bottom_items":
    case "poor_performers": {
      const bottom = await fetchBottomItems(range.start, range.end, params.limit || 5)
      const top = await fetchTopItems(range.start, range.end, 5)
      const allMenuItems = await fetchAllMenuItems()
      return { bottomItems: bottom, topItems: top, totalMenuItems: allMenuItems.length }
    }

    case "compare_sales": {
      const today = await fetchSalesSummary(startOfDay(new Date()), endOfDay(new Date()))
      const yesterday_date = subDays(new Date(), 1)
      const yesterday = await fetchSalesSummary(startOfDay(yesterday_date), endOfDay(yesterday_date))
      return { current: today, previous: yesterday, label: "today", previousLabel: "yesterday" }
    }

    case "best_day": {
      const trend = await fetchRevenueTrend(range.start, range.end)
      const sorted = [...trend].sort((a, b) => b.total - a.total)
      return { dailyRevenue: sorted, period: params.period || "all" }
    }

    case "slow_days": {
      const trend = await fetchRevenueTrend(range.start, range.end)
      const sorted = [...trend].sort((a, b) => a.total - b.total)
      return { dailyRevenue: sorted, period: params.period || "month" }
    }

    case "business_suggestion":
    case "promotion_suggestion":
    case "combo_suggestion": {
      const now = new Date()
      const monthStart = startOfDay(subDays(now, 29))
      const monthEnd = endOfDay(now)
      const [summary, topItems, bottomItems, menuItems] = await Promise.all([
        fetchSalesSummary(monthStart, monthEnd),
        fetchTopItems(monthStart, monthEnd, 10),
        fetchBottomItems(monthStart, monthEnd, 5),
        fetchAllMenuItems(),
      ])
      return { summary, topItems, bottomItems, totalMenuItems: menuItems.length }
    }

    case "sales_drop": {
      const now = new Date()
      const recentStart = subDays(now, 7)
      const prevStart = subDays(now, 14)
      const prevEnd = subDays(now, 7)
      const [recent, previous] = await Promise.all([
        fetchSalesSummary(startOfDay(recentStart), endOfDay(now)),
        fetchSalesSummary(startOfDay(prevStart), endOfDay(prevEnd)),
      ])
      return { current: recent, previous, label: "last 7 days", previousLabel: "previous 7 days" }
    }

    case "low_stock": {
      const lowStock = await fetchLowStock()
      const totalInventory = await prisma.inventory.count()
      return { lowStock, totalInventory, totalLow: lowStock.length }
    }

    case "general_chat": {
      return {}
    }

    default:
      return {}
  }
}
