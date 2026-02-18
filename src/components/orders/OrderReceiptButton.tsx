"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer, Loader2 } from "lucide-react"
import Receipt from "@/components/pos/Receipt"

interface OrderReceiptButtonProps {
  orderId: string
}

export function OrderReceiptButton({ orderId }: OrderReceiptButtonProps) {
  const [showReceipt, setShowReceipt] = useState(false)
  const [order, setOrder] = useState(null)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(false)

  const handlePrint = async () => {
    setLoading(true)
    try {
      // Fetch order and settings in parallel
      const [orderRes, settingsRes] = await Promise.all([
        fetch(`/api/orders/${orderId}`),
        fetch(`/api/settings`),
      ])

      const orderData = await orderRes.json()
      const settingsData = await settingsRes.json()

      if (orderData.data) setOrder(orderData.data)
      if (settingsData.success) setSettings(settingsData.data)

      setShowReceipt(true)
    } catch (error) {
      console.error("Failed to fetch order or settings:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="gap-2"
        onClick={handlePrint}
        disabled={loading}
      >
        {loading
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <Printer className="h-4 w-4" />
        }
        Print Receipt
      </Button>

      {order && showReceipt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full max-h-[90vh] overflow-auto p-4">
            <Receipt
              order={order}
              settings={settings ? {
                restaurantName: (settings as any).restaurantName,
                address: (settings as any).address ?? null,
                phone: (settings as any).phone ?? null,
                currency: (settings as any).currency ?? 'PKR',
                receiptHeader: (settings as any).receiptHeader ?? null,
                receiptFooter: (settings as any).receiptFooter ?? null,
              } : undefined}
              onClose={() => setShowReceipt(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}