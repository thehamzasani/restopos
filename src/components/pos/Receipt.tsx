"use client"
// src/components/pos/Receipt.tsx

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Order } from "@/types"
import { Printer, X } from "lucide-react"
import { format } from "date-fns"

interface ReceiptProps {
  order: Order & {
    user?: { name: string }
    table?: { number: number }
  }
  settings?: {
    restaurantName: string
    address?: string | null
    phone?: string | null
    currency: string
    receiptHeader?: string | null
    receiptFooter?: string | null
  }
  onClose?: () => void
}

const DEFAULT_SETTINGS = {
  restaurantName: "RestoPOS Restaurant",
  address: null,
  phone: null,
  currency: "PKR",  // ✅ change from USD to PKR
  receiptHeader: null,
  receiptFooter: "Thank you! Please visit again.",
}

function formatCurrency(amount: number, currency = "PKR") {
  if (currency === "PKR") {
    return `Rs ${amount.toFixed(2)}`
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export default function Receipt({ order, settings = DEFAULT_SETTINGS, onClose }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  const curr = settings.currency ?? "USD"
  const subtotal = Number(order.subtotal)
  const tax = Number(order.tax)
  const discount = Number(order.discount)
  const deliveryFee = Number(order.deliveryFee ?? 0)
  const total = Number(order.total)

  return (
    <div className="flex flex-col gap-4">
      {/* Action Buttons (hidden on print) */}
      <div className="flex items-center justify-between no-print">
        <h2 className="text-lg font-semibold">Receipt Preview</h2>
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Receipt Paper */}
      <div
        ref={receiptRef}
        id="receipt"
        className="bg-white font-mono text-sm mx-auto w-full max-w-sm border rounded-lg p-6 shadow-sm print:shadow-none print:border-none print:p-0"
      >
        {/* Restaurant Header */}
        <div className="text-center space-y-1 mb-4">
          {settings.receiptHeader && (
            <p className="text-xs text-gray-500 whitespace-pre-line">{settings.receiptHeader}</p>
          )}
          <h1 className="text-lg font-bold">{settings.restaurantName}</h1>
          {settings.address && <p className="text-xs text-gray-600">{settings.address}</p>}
          {settings.phone && <p className="text-xs text-gray-600">Tel: {settings.phone}</p>}
        </div>

        <p className="text-center text-xs text-gray-400">{'='.repeat(32)}</p>

        {/* Order Info */}
        <div className="my-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Order #:</span>
            <span className="font-bold">{order.orderNumber}</span>
          </div>

          {/* Order Type + Context */}
          {order.orderType === "DINE_IN" && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-bold">🍽️ DINE-IN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Table:</span>
                <span className="font-bold">{order.table?.number ?? "-"}</span>
              </div>
            </>
          )}

          {order.orderType === "TAKEAWAY" && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-bold">📦 TAKEAWAY</span>
              </div>
              {order.customerName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-semibold">{order.customerName}</span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span>{order.customerPhone}</span>
                </div>
              )}
            </>
          )}

          {order.orderType === "DELIVERY" && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-bold">🛵 DELIVERY</span>
              </div>
              {order.customerName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-semibold">{order.customerName}</span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span>{order.customerPhone}</span>
                </div>
              )}
              {order.deliveryAddress && (
                <div className="mt-1">
                  <p className="text-gray-600">Delivery Address:</p>
                  <p className="font-semibold break-words">{order.deliveryAddress}</p>
                </div>
              )}
              {order.deliveryNote && (
                <div>
                  <p className="text-gray-600">Note:</p>
                  <p className="italic">{order.deliveryNote}</p>
                </div>
              )}
            </>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span>{format(new Date(order.createdAt), "dd/MM/yyyy hh:mm a")}</span>
          </div>
          {order.user?.name && (
            <div className="flex justify-between">
              <span className="text-gray-600">Cashier:</span>
              <span>{order.user.name}</span>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400">{'-'.repeat(32)}</p>

        {/* Items */}
        <div className="my-3 space-y-2">
          {order.orderItems?.map((item) => {
            const lineTotal = Number(item.price) * item.quantity
            return (
              <div key={item.id} className="text-xs">
                <div className="flex justify-between">
                  <span className="flex-1 break-words pr-2">
                    {item.quantity}× {item.menuItem?.name ?? "Item"}
                  </span>
                  <span className="shrink-0">{formatCurrency(lineTotal, curr)}</span>
                </div>
                {item.notes && (
                  <p className="ml-3 text-gray-500 italic">- {item.notes}</p>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-gray-400">{'-'.repeat(32)}</p>

        {/* Totals */}
        <div className="my-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatCurrency(subtotal, curr)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-purple-600">
              <span>Discount:</span>
              <span>-{formatCurrency(discount, curr)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Tax:</span>
            <span>{formatCurrency(tax, curr)}</span>
          </div>
          {order.orderType === "DELIVERY" && deliveryFee > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee:</span>
              <span>{formatCurrency(deliveryFee, curr)}</span>
            </div>
          )}

          <p className="text-center text-xs text-gray-400">{'-'.repeat(32)}</p>

          <div className="flex justify-between font-bold text-base">
            <span>TOTAL:</span>
            <span>{formatCurrency(total, curr)}</span>
          </div>
          <p className="text-center text-xs text-gray-400">{'-'.repeat(32)}</p>

          {order.paymentMethod && (
            <div className="flex justify-between">
              <span className="text-gray-600">Payment:</span>
              <span className="font-semibold">{order.paymentMethod}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        {settings.receiptFooter && (
          <>
            <p className="text-center text-xs text-gray-400">{'='.repeat(32)}</p>
            <p className="text-center text-xs text-gray-500 mt-3 whitespace-pre-line">
              {settings.receiptFooter}
            </p>
          </>
        )}
      </div>
    </div>
  )
}