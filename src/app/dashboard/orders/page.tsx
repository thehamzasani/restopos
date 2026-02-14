import { OrderList } from "@/components/orders/OrderList"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Orders | RestoPOS",
  description: "Manage restaurant orders",
}

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500">View and manage all orders</p>
        </div>
        <Link href="/dashboard/pos">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </Link>
      </div>

      {/* Order List */}
      <OrderList />
    </div>
  )
}