// Utility functions for receipt printing

export interface ReceiptData {
  orderNumber: string
  orderType: "DINE_IN" | "TAKEAWAY"
  tableNumber?: number
  customerName?: string
  customerPhone?: string
  date: Date
  cashierName: string
  items: Array<{
    name: string
    quantity: number
    price: number
    subtotal: number
    notes?: string
  }>
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod?: string
  change?: number
}

export interface RestaurantInfo {
  name: string
  address?: string
  phone?: string
  email?: string
  receiptHeader?: string
  receiptFooter?: string
}

/**
 * Format currency for receipt display
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

/**
 * Format date for receipt
 */
export function formatReceiptDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(new Date(date))
}

/**
 * Generate receipt text for ESC/POS thermal printers
 */
export function generateThermalReceipt(
  receipt: ReceiptData,
  restaurant: RestaurantInfo
): string {
  let text = ""

  // Header
  text += centerText(restaurant.name) + "\n"
  if (restaurant.address) text += centerText(restaurant.address) + "\n"
  if (restaurant.phone) text += centerText(`Phone: ${restaurant.phone}`) + "\n"
  text += "================================\n"

  // Order info
  text += `Order #${receipt.orderNumber}\n`
  text += `Type: ${receipt.orderType === "DINE_IN" ? "DINE-IN" : "TAKEAWAY"}\n`
  
  if (receipt.orderType === "DINE_IN" && receipt.tableNumber) {
    text += `Table: ${receipt.tableNumber}\n`
  }
  
  if (receipt.orderType === "TAKEAWAY") {
    if (receipt.customerName) text += `Customer: ${receipt.customerName}\n`
    if (receipt.customerPhone) text += `Phone: ${receipt.customerPhone}\n`
  }
  
  text += `Date: ${formatReceiptDate(receipt.date)}\n`
  text += `Cashier: ${receipt.cashierName}\n`
  text += "--------------------------------\n"

  // Items
  receipt.items.forEach(item => {
    const itemLine = `${item.quantity}x ${item.name}`
    const priceLine = formatCurrency(item.subtotal)
    text += formatLine(itemLine, priceLine) + "\n"
    if (item.notes) {
      text += `   - ${item.notes}\n`
    }
  })
  
  text += "--------------------------------\n"

  // Totals
  text += formatLine("Subtotal:", formatCurrency(receipt.subtotal)) + "\n"
  text += formatLine("Tax:", formatCurrency(receipt.tax)) + "\n"
  if (receipt.discount > 0) {
    text += formatLine("Discount:", formatCurrency(receipt.discount)) + "\n"
  }
  text += "--------------------------------\n"
  text += formatLine("TOTAL:", formatCurrency(receipt.total), true) + "\n"
  text += "--------------------------------\n"

  // Payment
  if (receipt.paymentMethod) {
    text += `Payment: ${receipt.paymentMethod}\n`
    if (receipt.change && receipt.change > 0) {
      text += `Change: ${formatCurrency(receipt.change)}\n`
    }
  }

  // Footer
  text += "\n"
  if (restaurant.receiptFooter) {
    text += centerText(restaurant.receiptFooter) + "\n"
  } else {
    text += centerText("Thank you for your order!") + "\n"
    text += centerText("Please come again!") + "\n"
  }
  text += "================================\n"

  return text
}

/**
 * Center text for receipt (assumes 32 character width)
 */
function centerText(text: string, width: number = 32): string {
  const padding = Math.max(0, Math.floor((width - text.length) / 2))
  return " ".repeat(padding) + text
}

/**
 * Format a line with left and right aligned text
 */
function formatLine(left: string, right: string, bold: boolean = false): string {
  const totalWidth = 32
  const spaces = Math.max(1, totalWidth - left.length - right.length)
  return left + " ".repeat(spaces) + right
}

/**
 * Print receipt using browser print
 */
export function printReceipt(): void {
  window.print()
}

/**
 * Download receipt as text file (for ESC/POS printers)
 */
export function downloadReceiptText(text: string, orderNumber: string): void {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `receipt-${orderNumber}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}