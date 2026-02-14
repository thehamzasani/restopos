"use client"

import { useState } from "react"
import { KitchenOrderList } from "@/components/kitchen/KitchenOrderList"
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChefHat, RefreshCw, Volume2, VolumeX } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function KitchenPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "preparing">("all")
  const [soundEnabled, setSoundEnabled] = useState(false)

  const getStatusFilter = () => {
    switch (filter) {
      case "pending":
        return "PENDING"
      case "preparing":
        return "PREPARING"
      case "all":
      default:
        return "PENDING,PREPARING"
    }
  }

  const { orders, isLoading, mutate } = useRealtimeOrders({
    status: getStatusFilter(),
    refreshInterval: 5000,
  })

  const pendingCount = orders.filter((o: any) => o.status === "PENDING").length
  const preparingCount = orders.filter((o: any) => o.status === "PREPARING").length

  return (
    <div className="space-y-4">
      {/* Header - Compact */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <ChefHat className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Kitchen Display</h1>
            <p className="text-sm text-muted-foreground">
              Real-time orders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={soundEnabled ? "default" : "outline"}
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute notifications" : "Enable sound"}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600">Total Active</p>
              <p className="text-3xl font-bold text-blue-900">{orders.length}</p>
            </div>
            <ChefHat className="h-10 w-10 text-blue-400" />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-900">{pendingCount}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center">
              <span className="text-xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600">Preparing</p>
              <p className="text-3xl font-bold text-green-900">{preparingCount}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-400 flex items-center justify-center">
              <span className="text-xl">👨‍🍳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs - Compact */}
      <div className="flex items-center justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">
              All ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="preparing">
              Preparing ({preparingCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Auto-refresh indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Auto-refresh: 5s</span>
        </div>
      </div>

      {/* Orders Grid - More columns */}
      <KitchenOrderList orders={orders} isLoading={isLoading} onRefresh={mutate} />
    </div>
  )
}