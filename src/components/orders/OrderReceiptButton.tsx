"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer, Loader2, X } from "lucide-react"
import Receipt from "@/components/pos/Receipt"

interface OrderReceiptButtonProps {
  orderId: string
}

export function OrderReceiptButton({ orderId }: OrderReceiptButtonProps) {
  const [showReceipt, setShowReceipt] = useState(false)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)

  const handlePrint = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`)  // ✅ fixed backtick
      const data = await res.json()
      setOrder(data.data)
      setShowReceipt(true)
    } catch (error) {
      console.error("Failed to fetch order:", error)
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
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
        Print Receipt
      </Button>

      {/* ✅ No isOpen prop - just render when order exists */}
      {order && showReceipt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full max-h-[90vh] overflow-auto p-4">
            <Receipt
              order={order}
              onClose={() => setShowReceipt(false)}  // ✅ onClose exists in Receipt
            />
          </div>
        </div>
      )}
    </>
  )
}