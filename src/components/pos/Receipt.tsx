"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Printer, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency, formatReceiptDate, generateThermalReceipt, printReceipt, downloadReceiptText } from "@/lib/receipt-printer"
import type { ReceiptData, RestaurantInfo } from "@/lib/receipt-printer"

interface ReceiptProps {
  orderId: string
  isOpen: boolean
  onClose: () => void
}

export function Receipt({ orderId, isOpen, onClose }: ReceiptProps) {
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && orderId) {
      fetchReceiptData()
    }
  }, [isOpen, orderId])

  const fetchReceiptData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/orders/${orderId}/receipt`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch receipt")
      }

      setReceiptData(result.data.receipt)
      setRestaurantInfo(result.data.restaurant)
    } catch (err: any) {
      console.error("Error fetching receipt:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    printReceipt()
  }

  const handleDownload = () => {
    if (receiptData && restaurantInfo) {
      const text = generateThermalReceipt(receiptData, restaurantInfo)
      downloadReceiptText(text, receiptData.orderNumber)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Receipt</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading receipt...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            <p className="text-sm font-medium">Error loading receipt</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        )}

        {!isLoading && !error && receiptData && restaurantInfo && (
          <>
            {/* Print area */}
            <div id="receipt-print-area">
              <div className="receipt-container">
                {/* Header */}
                <div className="receipt-header">
                  <div className="restaurant-name">{restaurantInfo.name}</div>
                  <div className="restaurant-info">
                    {restaurantInfo.address && <div>{restaurantInfo.address}</div>}
                    {restaurantInfo.phone && <div>Phone: {restaurantInfo.phone}</div>}
                    {restaurantInfo.email && <div>Email: {restaurantInfo.email}</div>}
                  </div>
                  {restaurantInfo.receiptHeader && (
                    <div className="mt-2 text-sm">{restaurantInfo.receiptHeader}</div>
                  )}
                </div>

                {/* Order Information */}
                <div className="order-info">
                  <div className="order-info-row">
                    <span>Order #:</span>
                    <span className="font-bold">{receiptData.orderNumber}</span>
                  </div>
                  <div className="order-info-row">
                    <span>Type:</span>
                    <span className="order-type-badge">
                      {receiptData.orderType === "DINE_IN" ? "🍽️ DINE-IN" : "📦 TAKEAWAY"}
                    </span>
                  </div>

                  {/* Dine-in: Show table */}
                  {receiptData.orderType === "DINE_IN" && receiptData.tableNumber && (
                    <div className="highlight-info">
                      Table: {receiptData.tableNumber}
                    </div>
                  )}

                  {/* Takeaway: Show customer details */}
                  {receiptData.orderType === "TAKEAWAY" && (
                    <>
                      {receiptData.customerName && (
                        <div className="order-info-row">
                          <span>Customer:</span>
                          <span className="font-medium">{receiptData.customerName}</span>
                        </div>
                      )}
                      {receiptData.customerPhone && (
                        <div className="order-info-row">
                          <span>Phone:</span>
                          <span className="font-medium">{receiptData.customerPhone}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="order-info-row">
                    <span>Date:</span>
                    <span>{formatReceiptDate(receiptData.date)}</span>
                  </div>
                  <div className="order-info-row">
                    <span>Cashier:</span>
                    <span>{receiptData.cashierName}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="items-section">
                  {receiptData.items.map((item, index) => (
                    <div key={index}>
                      <div className="item-row">
                        <div className="item-name">
                          {item.quantity}x {item.name}
                        </div>
                        <div className="item-price">{formatCurrency(item.subtotal)}</div>
                      </div>
                      {item.notes && <div className="item-note">- {item.notes}</div>}
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="totals-section">
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(receiptData.subtotal)}</span>
                  </div>
                  <div className="total-row">
                    <span>Tax:</span>
                    <span>{formatCurrency(receiptData.tax)}</span>
                  </div>
                  {receiptData.discount > 0 && (
                    <div className="total-row">
                      <span>Discount:</span>
                      <span>-{formatCurrency(receiptData.discount)}</span>
                    </div>
                  )}
                  <div className="total-row grand-total">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(receiptData.total)}</span>
                  </div>
                </div>

                {/* Payment */}
                {receiptData.paymentMethod && (
                  <div className="payment-section">
                    <div className="total-row">
                      <span>Payment Method:</span>
                      <span className="font-bold">{receiptData.paymentMethod}</span>
                    </div>
                    {receiptData.change && receiptData.change > 0 && (
                      <div className="total-row">
                        <span>Change:</span>
                        <span className="font-bold">{formatCurrency(receiptData.change)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="receipt-footer">
                  {restaurantInfo.receiptFooter ? (
                    <div>{restaurantInfo.receiptFooter}</div>
                  ) : (
                    <>
                      <div>Thank you for your order!</div>
                      <div>Please come again!</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons (not printed) */}
            <div className="print-actions no-print flex gap-2">
              <Button onClick={handlePrint} className="flex-1">
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
              <Button onClick={handleDownload} variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}