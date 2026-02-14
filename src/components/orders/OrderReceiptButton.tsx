"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { Receipt } from "@/components/pos/Receipt"

interface OrderReceiptButtonProps {
  orderId: string
}

export function OrderReceiptButton({ orderId }: OrderReceiptButtonProps) {
  const [showReceipt, setShowReceipt] = useState(false)

  return (
    <>
      <Button 
        variant="outline" 
        className="gap-2"
        onClick={() => setShowReceipt(true)}
      >
        <Printer className="h-4 w-4" />
        Print Receipt
      </Button>

      <Receipt 
        orderId={orderId}
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
      />
    </>
  )
}