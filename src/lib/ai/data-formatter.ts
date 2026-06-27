export function formatSalesSummary(summary: Record<string, any>): string {
  const lines: string[] = [
    `Total Revenue: Rs ${summary.totalRevenue?.toLocaleString() ?? 0}`,
    `Total Orders: ${summary.totalOrders ?? 0}`,
    `Average Order Value: Rs ${summary.averageOrderValue?.toLocaleString() ?? 0}`,
    `Total Discount Given: Rs ${summary.totalDiscount?.toLocaleString() ?? 0}`,
    `Order Breakdown: ${summary.dineIn ?? 0} Dine-In, ${summary.takeaway ?? 0} Takeaway, ${summary.delivery ?? 0} Delivery`,
  ]
  return lines.join("\n")
}

export function formatDailyTrend(trend: Array<{ date: string; total: number; count: number }>): string {
  if (!trend || trend.length === 0) return "No daily data available."
  return trend
    .map((d, i) => {
      const date = new Date(d.date)
      const formatted = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      const marker = i === 0 ? " ← HIGHEST" : ""
      return `  ${i + 1}. ${formatted}: Rs ${d.total.toLocaleString()} (${d.count} orders)${marker}`
    })
    .join("\n")
}

export function formatTopItems(items: Array<{ name: string; quantity: number; revenue: number; avgPrice?: number }>): string {
  if (!items || items.length === 0) return "No items sold in this period."
  return items
    .map((item, i) => `  ${i + 1}. ${item.name} — ${item.quantity} orders, Rs ${item.revenue.toLocaleString()}`)
    .join("\n")
}

export function formatBottomItems(items: Array<{ name: string; quantity: number; revenue: number }>): string {
  if (!items || items.length === 0) return "All menu items have sales. No underperformers detected."
  return items
    .map((item, i) => `  ${i + 1}. ${item.name} — only ${item.quantity} orders, Rs ${item.revenue.toLocaleString()}`)
    .join("\n")
}

export function formatComparison(current: Record<string, any>, previous: Record<string, any>, label: string, prevLabel: string): string {
  const currentRev = current.totalRevenue ?? 0
  const previousRev = previous.totalRevenue ?? 0
  const diff = currentRev - previousRev
  const pct = previousRev > 0 ? Math.round((diff / previousRev) * 100) : 0
  const icon = diff > 0 ? "↑" : diff < 0 ? "↓" : "→"

  return [
    `── ${label} ──`,
    `  Revenue: Rs ${currentRev.toLocaleString()}`,
    `  Orders: ${current.totalOrders ?? 0}`,
    `  Avg Order: Rs ${current.averageOrderValue?.toLocaleString() ?? 0}`,
    ``,
    `── ${prevLabel} ──`,
    `  Revenue: Rs ${previousRev.toLocaleString()}`,
    `  Orders: ${previous.totalOrders ?? 0}`,
    `  Avg Order: Rs ${previous.averageOrderValue?.toLocaleString() ?? 0}`,
    ``,
    `── Difference ──`,
    `  ${icon} Rs ${Math.abs(diff).toLocaleString()} (${pct}%)`,
  ].join("\n")
}

export function formatLowStock(items: Array<{ name: string; quantity: number; lowStockThreshold: number; unit: string; supplier?: { name: string } | null }>): string {
  if (!items || items.length === 0) return "All inventory items are well-stocked!"
  return items
    .map((item) => `  • ${item.name}: ${item.quantity} ${item.unit} (threshold: ${item.lowStockThreshold})${item.supplier ? ` — Supplier: ${item.supplier.name}` : ""}`)
    .join("\n")
}

export function formatRecentOrders(orders: Array<{
  id: string
  orderNumber: string
  orderType: string
  total: number
  subtotal: number
  discount: number
  status: string
  paymentMethod: string | null
  createdAt: Date
  customerName: string | null
  customerPhone: string | null
  items: Array<{ name: string; quantity: number; subtotal: number }>
}>): string {
  if (!orders || orders.length === 0) return "No orders found."
  return orders
    .map((o) => {
      const time = new Date(o.createdAt).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      })
      const customer = o.customerName ? ` (${o.customerName})` : ""
      const items = o.items.map((i) => `    ${i.quantity}x ${i.name} — Rs ${i.subtotal.toLocaleString()}`).join("\n")
      return [
        `  #${o.orderNumber || o.id.slice(0, 8)} — ${o.orderType} — ${time}${customer}`,
        `    Total: Rs ${o.total.toLocaleString()} | Payment: ${o.paymentMethod || "N/A"} | Status: ${o.status}`,
        items,
      ].join("\n")
    })
    .join("\n\n")
}

export function formatDataForPrompt(data: Record<string, any>, intent: string): string {
  if (!data || Object.keys(data).length === 0) {
    return "NO DATA: No restaurant data is available."
  }

  const sections: string[] = []

  if (data.summary && intent !== "best_day" && intent !== "slow_days") {
    sections.push("📊 SALES SUMMARY")
    sections.push(formatSalesSummary(data.summary))
  }

  if (data.dailyRevenue && Array.isArray(data.dailyRevenue)) {
    if (intent === "best_day") {
      sections.push("📈 DAILY REVENUE (sorted highest first)")
    } else if (intent === "slow_days") {
      sections.push("📈 DAILY REVENUE (sorted lowest first)")
    } else {
      sections.push("📈 DAILY REVENUE BREAKDOWN")
    }
    sections.push(formatDailyTrend(data.dailyRevenue))
  }

  if (data.topItems && Array.isArray(data.topItems)) {
    sections.push("🏆 TOP SELLING ITEMS")
    sections.push(formatTopItems(data.topItems))
  }

  if (data.bottomItems && Array.isArray(data.bottomItems)) {
    sections.push("⚠️ LOW PERFORMING ITEMS")
    sections.push(formatBottomItems(data.bottomItems))
  }

  if (data.current && data.previous) {
    sections.push(formatComparison(data.current, data.previous, data.label || "Current", data.previousLabel || "Previous"))
  }

  if (data.lowStock && Array.isArray(data.lowStock)) {
    sections.push("📦 LOW STOCK ALERTS")
    sections.push(formatLowStock(data.lowStock))
    if (data.totalInventory) {
      sections.push(`Total inventory items: ${data.totalInventory}, Low: ${data.totalLow}`)
    }
  }

  if (data.recentOrders && Array.isArray(data.recentOrders)) {
    sections.push("📋 RECENT ORDERS")
    sections.push(formatRecentOrders(data.recentOrders))
  }

  if (data.trend && Array.isArray(data.trend)) {
    sections.push("📈 DAILY BREAKDOWN")
    sections.push(formatDailyTrend(data.trend))
  }

  if (sections.length === 1 && sections[0] === "NO DATA: No restaurant data is available.") {
    return sections[0]
  }

  return sections.join("\n\n")
}
