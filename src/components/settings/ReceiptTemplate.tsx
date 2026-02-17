// src/components/settings/ReceiptTemplate.tsx

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface ReceiptTemplateProps {
  settings: {
    restaurantName: string
    address?: string | null
    phone?: string | null
    receiptHeader?: string | null
    receiptFooter?: string | null
    taxRate: number
    currency: string
  }
}

export function ReceiptTemplate({ settings }: ReceiptTemplateProps) {
  const {
    restaurantName,
    address,
    phone,
    receiptHeader,
    receiptFooter,
    taxRate,
    currency,
  } = settings
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY">("DINE_IN")

  // Sample data for preview
  const subtotal = 28.0
  const calculatedTax = (subtotal * Number(taxRate)) / 100
  const total = subtotal + calculatedTax

  const sampleOrder = {
    orderNumber: "ORD-1234",
    date: new Date().toLocaleString(),
    cashier: "John Smith",
    table: 5,
    customerName: "Jane Smith",
    customerPhone: "555-9876",
    items: [
      { name: "Burger", quantity: 2, price: 10.0, notes: "No onions" },
      { name: "Fries (Large)", quantity: 1, price: 5.0, notes: null },
      { name: "Coke", quantity: 1, price: 3.0, notes: null },
    ],
    subtotal: subtotal,
    tax: calculatedTax,
    discount: 0,
    total: total,
    paymentMethod: "CASH",
    amountPaid: 50.0,
    change: 50.0 - total,
  }

  return (
    <div className="space-y-6">
      {/* Preview Toggle */}
      <div>
        <label className="text-sm font-medium mb-2 block">Preview Type</label>
        <Tabs value={orderType} onValueChange={(v) => setOrderType(v as any)}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="DINE_IN">🍽️ Dine-In Receipt</TabsTrigger>
            <TabsTrigger value="TAKEAWAY">📦 Takeaway Receipt</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Receipt Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Receipt Preview</span>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Test Print
            </Button>
          </CardTitle>
          <CardDescription>
            This is how your receipts will look when printed. Update restaurant info and
            receipt text in the General tab above.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="receipt-preview mx-auto max-w-sm rounded-lg border bg-white p-6 font-mono text-sm shadow-lg">
            {/* Header */}
            <div className="border-b-2 border-dashed border-gray-800 pb-4 text-center">
              <div className="text-lg font-bold">{restaurantName}</div>
              {address && <div className="text-xs text-gray-600">{address}</div>}
              {phone && <div className="text-xs text-gray-600">Phone: {phone}</div>}
            </div>

            {/* Custom Header */}
            {receiptHeader && (
              <div className="my-4 border-b border-dashed border-gray-400 pb-3 text-center text-xs italic text-gray-600">
                {receiptHeader}
              </div>
            )}

            {/* Order Info */}
            <div className="my-4 space-y-1 border-b border-dashed border-gray-800 pb-3">
              <div className="flex justify-between">
                <span className="font-semibold">Order #:</span>
                <span>{sampleOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Type:</span>
                <span className="rounded bg-gray-800 px-2 py-0.5 text-xs text-white">
                  {orderType === "DINE_IN" ? "🍽️ DINE-IN" : "📦 TAKEAWAY"}
                </span>
              </div>
              {orderType === "DINE_IN" ? (
                <div className="my-2 rounded bg-gray-100 p-2 text-center font-bold">
                  TABLE: {sampleOrder.table}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold">Customer:</span>
                    <span>{sampleOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Phone:</span>
                    <span>{sampleOrder.customerPhone}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-semibold">Date:</span>
                <span>{sampleOrder.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Cashier:</span>
                <span>{sampleOrder.cashier}</span>
              </div>
            </div>

            {/* Items */}
            <div className="my-4 border-b-2 border-gray-800 pb-3">
              {sampleOrder.items.map((item, index) => (
                <div key={index} className="mb-2">
                  <div className="flex justify-between">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>{currency} {(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                  {item.notes && (
                    <div className="ml-4 text-xs text-gray-600">- {item.notes}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 border-b-2 border-gray-800 pb-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{currency} {sampleOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({Number(taxRate)}%):</span>
                <span>{currency} {sampleOrder.tax.toFixed(2)}</span>
              </div>
              {sampleOrder.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-{currency} {sampleOrder.discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="my-3 flex justify-between border-b-2 border-gray-800 pb-3 text-lg font-bold">
              <span>TOTAL:</span>
              <span>{currency} {sampleOrder.total.toFixed(2)}</span>
            </div>

            {/* Payment */}
            <div className="mb-4 space-y-1 border-b border-dashed border-gray-800 pb-3">
              <div className="flex justify-between">
                <span className="font-semibold">Payment:</span>
                <span>{sampleOrder.paymentMethod}</span>
              </div>
              {sampleOrder.paymentMethod === "CASH" && (
                <>
                  <div className="flex justify-between text-xs">
                    <span>Amount Paid:</span>
                    <span>{currency} {sampleOrder.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Change:</span>
                    <span>{currency} {sampleOrder.change.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Custom Footer */}
            {receiptFooter ? (
              <div className="text-center text-xs italic text-gray-600">
                {receiptFooter}
              </div>
            ) : (
              <div className="text-center text-xs text-gray-600">
                Thank you for {orderType === "DINE_IN" ? "dining" : "ordering"} with us!
                <br />
                {orderType === "DINE_IN" ? "Visit us again soon!" : "Please come again!"}
              </div>
            )}

            {/* Separator */}
            <div className="mt-4 border-t-2 border-dashed border-gray-800 pt-2 text-center text-xs">
              ════════════════════════
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-blue-900">
            <p>
              <strong>How to customize your receipts:</strong>
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>
                <strong>Restaurant Info:</strong> Update in the "General" tab above (name, address,
                phone)
              </li>
              <li>
                <strong>Header Message:</strong> Add a welcome message (appears at the top)
              </li>
              <li>
                <strong>Footer Message:</strong> Add a thank you message (appears at the bottom)
              </li>
              <li>
                <strong>Order Type:</strong> Receipts automatically adapt for Dine-In or Takeaway
                orders
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}