import { subDays, startOfDay, endOfDay } from "date-fns"

export type Intent =
  | "daily_sales"
  | "top_items"
  | "bottom_items"
  | "compare_sales"
  | "period_sales"
  | "best_day"
  | "slow_days"
  | "poor_performers"
  | "business_suggestion"
  | "promotion_suggestion"
  | "combo_suggestion"
  | "sales_drop"
  | "low_stock"
  | "recent_orders"
  | "general_chat"

export interface IntentResult {
  intent: Intent
  params: Record<string, any>
}

function extractDateParams(text: string): Record<string, any> {
  if (/today/i.test(text) && !/yesterday/i.test(text)) {
    return { period: "today" }
  }
  if (/yesterday/i.test(text)) {
    return { period: "yesterday" }
  }
  if (/last\s+week/i.test(text)) {
    const end = subDays(new Date(), 1)
    const start = subDays(new Date(), 7)
    return { start: startOfDay(start).toISOString(), end: endOfDay(end).toISOString(), period: "week" }
  }
  if (/this\s+week/i.test(text)) {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const start = subDays(now, dayOfWeek)
    return { start: startOfDay(start).toISOString(), end: endOfDay(now).toISOString(), period: "week" }
  }
  if (/last\s+month/i.test(text)) {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
    return { start: start.toISOString(), end: end.toISOString(), period: "month" }
  }
  if (/this\s+month/i.test(text)) {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { start: startOfDay(start).toISOString(), end: endOfDay(now).toISOString(), period: "month" }
  }

  // Match dates like "20 June" or "20 June 2026" (day first)
  const months = "january|february|march|april|may|june|july|august|september|october|november|december"
  const monthsShort = "jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec"
  const allMonths = months + "|" + monthsShort
  const dayFirstRegex = new RegExp(
    `(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${allMonths})\\s*(\\d{4})?`,
    "i",
  )
  const dayFirstMatch = text.match(dayFirstRegex)
  if (dayFirstMatch) {
    const day = parseInt(dayFirstMatch[1])
    const monthStr = dayFirstMatch[2].toLowerCase()
    const monthNames = months.split("|").concat(monthsShort.split("|"))
    const monthIndex = monthNames.indexOf(monthStr) % 12
    const year = dayFirstMatch[3] ? parseInt(dayFirstMatch[3]) : new Date().getFullYear()
    const date = new Date(year, monthIndex, day)
    return {
      start: startOfDay(date).toISOString(),
      end: endOfDay(date).toISOString(),
      period: "custom",
    }
  }

  // Match dates like "April 13" or "April 13 2026" (month first)
  const monthFirstRegex = new RegExp(
    `(${allMonths})\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s*(\\d{4})?`,
    "i",
  )
  const monthFirstMatch = text.match(monthFirstRegex)
  if (monthFirstMatch) {
    const monthStr = monthFirstMatch[1].toLowerCase()
    const day = parseInt(monthFirstMatch[2])
    const monthNames = months.split("|").concat(monthsShort.split("|"))
    const monthIndex = monthNames.indexOf(monthStr) % 12
    const year = monthFirstMatch[3] ? parseInt(monthFirstMatch[3]) : new Date().getFullYear()
    const date = new Date(year, monthIndex, day)
    return {
      start: startOfDay(date).toISOString(),
      end: endOfDay(date).toISOString(),
      period: "custom",
    }
  }

  return {}
}

export function classifyIntent(message: string): IntentResult {
  const lower = message.toLowerCase().trim()
  const dateParams = extractDateParams(lower)

  // Inventory / stock questions
  if (/(running low|low stock|reorder|restock|expir|stock left|need to order)/i.test(lower)) {
    return { intent: "low_stock", params: {} }
  }

  // Sales drop detection
  if (/(unusual|drop in sales|sales drop|decline|decreasing|went down)/i.test(lower)) {
    return { intent: "sales_drop", params: {} }
  }

  // Combo suggestions
  if (/(combo|bundle|pair|together|goes well)/i.test(lower)) {
    return { intent: "combo_suggestion", params: {} }
  }

  // Business suggestions (increase sales, improve, etc.)
  if (/(suggestion|increase sales|improve|grow business|do better|attract more|customers)/i.test(lower)) {
    return { intent: "business_suggestion", params: {} }
  }

  // Promotion suggestions
  if (/(promote|promotion|featured|special offer|discount|should (i )?promote)/i.test(lower)) {
    return { intent: "promotion_suggestion", params: {} }
  }

  // Poor performers / remove from menu
  if (/(remove from menu|should (i )?remove|rarely sell|rarely sold|least popular|worst|underperform)/i.test(lower)) {
    return { intent: "poor_performers", params: {} }
  }

  // Bottom / least sold items
  if (/(sold (the )?least|least sold|lowest selling|sold (the )?least|hardly sells)/i.test(lower)) {
    return { intent: "bottom_items", params: { limit: 5, ...dateParams } }
  }

  // Best day / highest sales day (with common typos: higest, hightest)
  if (/(h[i1]g+h?[e3a]s+t\s+sales\s+day|best day|which day (had|has) the (highest|most)|peak day|best performing day|most sales|maximum|highest revenue|highest sales)/i.test(lower)) {
    const isAllTime = /(until now|all time|ever|of all time|since beginning|history|record|of all time)/i.test(lower)
    return { intent: "best_day", params: { period: isAllTime ? "all" : (dateParams.period || "all") } }
  }

  // Slow days
  if (/(slow sales|slow days|quiet days|lowest (sales|days))/i.test(lower)) {
    return { intent: "slow_days", params: { period: dateParams.period || "month" } }
  }

  // Top items / best sellers / most profitable
  if (/(top seller|best selling|sold best|what sold|most popular|top \d|top selling|bestseller|most profitable|most profit)/i.test(lower)) {
    const limitMatch = lower.match(/top\s+(\d+)/i)
    return { intent: "top_items", params: { limit: limitMatch ? parseInt(limitMatch[1]) : 5, ...dateParams } }
  }

  // Compare sales
  if (/(compare|vs |versus|than yesterday|difference between)/i.test(lower)) {
    return { intent: "compare_sales", params: {} }
  }

  // Recent / last orders (must come before dateParam fallback)
  if (/(what (was|were|did)|show|list|get).*(last|latest|recent|today'?s|yesterday'?s).*(order|ordered|sold|sale|transaction)/i.test(lower)
    || /(last|latest|recent|next)\s+(\d+\s+)?(order|ordered|sale)/i.test(lower)
    || /(orders?\s+(today|yesterday|recent|latest|last))/i.test(lower)) {
    const countMatch = lower.match(/(\d+)\s+orders?/i)
    return { intent: "recent_orders", params: { limit: countMatch ? parseInt(countMatch[1]) : 5, ...dateParams } }
  }

  // Specific date range query with no other intent matched
  if (dateParams.period) {
    if (/(total sales|sales (report|for|in|of)|revenue|how much|how many orders|orders)/i.test(lower)) {
      return { intent: "period_sales", params: dateParams }
    }
    return { intent: "period_sales", params: dateParams }
  }

  // General data queries (no specific date)
  if (/(total sales|sales today|today'?s sales|how much (did we|have we)|how many orders|revenue|sales report|show sales)/i.test(lower)) {
    return { intent: "daily_sales", params: { period: "today" } }
  }
  if (/(sales yesterday|yesterday'?s sales)/i.test(lower)) {
    return { intent: "daily_sales", params: { period: "yesterday" } }
  }

  // Fallback
  return { intent: "general_chat", params: {} }
}
