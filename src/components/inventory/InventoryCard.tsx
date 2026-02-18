// src/components/inventory/InventoryCard.tsx

"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Minus,
  RefreshCw,
  AlertTriangle,
  Package,
} from "lucide-react"
import { format } from "date-fns"
import { StockHistory } from "./StockHistory"

interface InventoryCardProps {
  item: any
  onEdit: (item: any) => void
  onUpdate: () => void
}

export function InventoryCard({ item, onEdit, onUpdate }: InventoryCardProps) {
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Stock adjustment state
  const [adjustmentType, setAdjustmentType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN")
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("")
  const [adjustmentReason, setAdjustmentReason] = useState("")
  const [isAdjusting, setIsAdjusting] = useState(false)

  const isLowStock = item.quantity <= item.lowStockThreshold
  const stockPercentage = (item.quantity / item.lowStockThreshold) * 100

  const getStockStatusColor = () => {
    if (stockPercentage <= 50) return "bg-red-500"
    if (stockPercentage <= 100) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStockStatusText = () => {
    if (stockPercentage <= 50) return "Critical"
    if (stockPercentage <= 100) return "Low"
    return "Good"
  }

  const handleAdjustStock = async () => {
    if (!adjustmentQuantity || Number(adjustmentQuantity) <= 0) {
      toast.error("Please enter a valid quantity")
      return
    }

    setIsAdjusting(true)
    try {
      const response = await fetch(`/api/inventory/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: Number(adjustmentQuantity),
          type: adjustmentType,
          reason: adjustmentReason || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Stock adjusted successfully")
        setIsAdjustDialogOpen(false)
        setAdjustmentQuantity("")
        setAdjustmentReason("")
        onUpdate()
      } else {
        toast.error(data.error || "Failed to adjust stock")
      }
    } catch (error) {
      console.error("Error adjusting stock:", error)
      toast.error("Failed to adjust stock")
    } finally {
      setIsAdjusting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/inventory/${item.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Inventory item deleted")
        setIsDeleteDialogOpen(false)
        onUpdate()
      } else {
        toast.error(data.error || "Failed to delete item")
      }
    } catch (error) {
      console.error("Error deleting item:", error)
      toast.error("Failed to delete item")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className={isLowStock ? "border-l-4 border-l-red-500" : ""}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-500" />
                <CardTitle className="text-lg">{item.name}</CardTitle>
              </div>
              {item.description && (
                <CardDescription className="mt-1">
                  {item.description}
                </CardDescription>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsAdjustDialogOpen(true)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Adjust Stock
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsHistoryDialogOpen(true)}>
                  <Package className="h-4 w-4 mr-2" />
                  Stock History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stock Status Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant={isLowStock ? "destructive" : "default"}
              className="flex items-center gap-1"
            >
              {isLowStock && <AlertTriangle className="h-3 w-3" />}
              {getStockStatusText()}
            </Badge>
          </div>

          {/* Quantity Display */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold">
                {item.quantity} {item.unit}
              </span>
              <span className="text-sm text-gray-500">
                Threshold: {item.lowStockThreshold} {item.unit}
              </span>
            </div>
            
            {/* Stock Level Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getStockStatusColor()}`}
                style={{
                  width: `${Math.min(stockPercentage, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {item.costPerUnit && (
              <div>
                <p className="text-gray-500">Cost/Unit</p>
                <p className="font-medium">Rs {item.costPerUnit.toFixed(2)}</p>
              </div>
            )}
            {item.supplier && (
              <div>
                <p className="text-gray-500">Supplier</p>
                <p className="font-medium truncate">{item.supplier.name}</p>
              </div>
            )}
          </div>

          {item.lastRestocked && (
            <p className="text-xs text-gray-500">
              Last restocked: {format(new Date(item.lastRestocked), "MMM d, yyyy")}
            </p>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setAdjustmentType("IN")
                setIsAdjustDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Stock
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setAdjustmentType("OUT")
                setIsAdjustDialogOpen(true)
              }}
            >
              <Minus className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock - {item.name}</DialogTitle>
            <DialogDescription>
              Current stock: {item.quantity} {item.unit}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Adjustment Type</Label>
              <Select
                value={adjustmentType}
                onValueChange={(value: any) => setAdjustmentType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">Add Stock (IN)</SelectItem>
                  <SelectItem value="OUT">Remove Stock (OUT)</SelectItem>
                  <SelectItem value="ADJUSTMENT">Manual Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                {adjustmentType === "ADJUSTMENT"
                  ? "New Quantity"
                  : "Quantity"}
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(e.target.value)}
                placeholder={`Enter quantity in ${item.unit}`}
              />
            </div>

            <div>
              <Label>Reason (Optional)</Label>
              <Textarea
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="E.g., Restocking from supplier, Spoilage, etc."
                rows={2}
              />
            </div>

            {/* Preview */}
            {adjustmentQuantity && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium">Preview:</p>
                <p className="text-sm text-gray-600">
                  {adjustmentType === "IN" &&
                    `New stock: ${(Number(item.quantity) + Number(adjustmentQuantity)).toFixed(2)} ${item.unit}`}
                  {adjustmentType === "OUT" &&
                    `New stock: ${Math.max(0, Number(item.quantity) - Number(adjustmentQuantity)).toFixed(2)} ${item.unit}`}
                  {adjustmentType === "ADJUSTMENT" &&
                    `New stock: ${Number(adjustmentQuantity).toFixed(2)} ${item.unit}`}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAdjustDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAdjustStock} disabled={isAdjusting}>
              {isAdjusting ? "Adjusting..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Stock History - {item.name}</DialogTitle>
          </DialogHeader>
          <StockHistory itemId={item.id} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Inventory Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{item.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}