// src/components/inventory/LowStockAlert.tsx

"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, X, Package } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface LowStockAlertProps {
  items: any[]
  onRestock?: () => void
}

export function LowStockAlert({ items, onRestock }: LowStockAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (isDismissed || items.length === 0) {
    return null
  }

  const criticalItems = items.filter(
    (item) => item.quantity / item.lowStockThreshold <= 0.5
  )
  const lowItems = items.filter(
    (item) =>
      item.quantity / item.lowStockThreshold > 0.5 &&
      item.quantity <= item.lowStockThreshold
  )

  return (
    <>
      <Alert variant="destructive" className="border-l-4 border-l-red-600">
        <AlertTriangle className="h-5 w-5" />
        <div className="flex items-start justify-between flex-1">
          <div className="flex-1">
            <AlertTitle className="text-lg font-semibold mb-2">
              Low Stock Alert
            </AlertTitle>
            <AlertDescription className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {criticalItems.length > 0 && (
                  <Badge variant="destructive">
                    {criticalItems.length} Critical
                  </Badge>
                )}
                {lowItems.length > 0 && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {lowItems.length} Low
                  </Badge>
                )}
              </div>
              <p className="text-sm">
                {criticalItems.length > 0
                  ? `${criticalItems.length} item(s) critically low on stock. `
                  : ""}
                {lowItems.length > 0
                  ? `${lowItems.length} item(s) below threshold. `
                  : ""}
                Immediate restocking recommended.
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsDialogOpen(true)}
                >
                  View Details
                </Button>
              </div>
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Low Stock Items ({items.length})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Critical Items */}
            {criticalItems.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                  <Badge variant="destructive">Critical</Badge>
                  Items below 50% threshold
                </h4>
                <div className="space-y-2">
                  {criticalItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            Current: {item.quantity} {item.unit} | Threshold:{" "}
                            {item.lowStockThreshold} {item.unit}
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive">
                        {Math.round(
                          (item.quantity / item.lowStockThreshold) * 100
                        )}
                        %
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low Items */}
            {lowItems.length > 0 && (
              <div>
                <h4 className="font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800">Low</Badge>
                  Items at or below threshold
                </h4>
                <div className="space-y-2">
                  {lowItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-yellow-200 bg-yellow-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            Current: {item.quantity} {item.unit} | Threshold:{" "}
                            {item.lowStockThreshold} {item.unit}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {Math.round(
                          (item.quantity / item.lowStockThreshold) * 100
                        )}
                        %
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}