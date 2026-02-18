"use client"
// src/components/reports/OrderTypeChart.tsx

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UtensilsCrossed, Package, Bike } from "lucide-react"

interface OrderTypeChartProps {
  data: {
    dineIn: { orders: number; revenue: number }
    takeaway: { orders: number; revenue: number }
    delivery: { orders: number; revenue: number }
  }
}

const COLORS = {
  "Dine-In": "#3b82f6",
  Takeaway: "#f97316",
  Delivery: "#22c55e",
}

function StatCard({
  label,
  orders,
  revenue,
  icon: Icon,
  color,
}: {
  label: string
  orders: number
  revenue: number
  icon: React.ElementType
  color: string
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg bg-opacity-10`} style={{ backgroundColor: `${color}15` }}>
      <div className="rounded-full p-2" style={{ backgroundColor: `${color}20` }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm font-bold text-gray-900">{orders} orders</p>
        <p className="text-xs text-gray-600">Rs {revenue.toFixed(2)}</p>
      </div>
    </div>
  )
}

export default function OrderTypeChart({ data }: OrderTypeChartProps) {
  const chartData = [
    { name: "Dine-In", value: data.dineIn.orders, revenue: data.dineIn.revenue },
    { name: "Takeaway", value: data.takeaway.orders, revenue: data.takeaway.revenue },
    { name: "Delivery", value: data.delivery.orders, revenue: data.delivery.revenue },
  ].filter((d) => d.value > 0)

  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.[0]) {
      const item = payload[0].payload
      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0"
      return (
        <div className="bg-white border rounded-lg shadow-sm p-3 text-sm">
          <p className="font-semibold">{item.name}</p>
          <p className="text-gray-600">{item.value} orders ({pct}%)</p>
          <p className="text-gray-600">Rs {item.revenue.toFixed(2)} revenue</p>
        </div>
      )
    }
    return null
  }

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Type Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40 text-gray-400 text-sm">
          No order data yet
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Order Type Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-xs text-gray-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard
            label="Dine-In"
            orders={data.dineIn.orders}
            revenue={data.dineIn.revenue}
            icon={UtensilsCrossed}
            color="#3b82f6"
          />
          <StatCard
            label="Takeaway"
            orders={data.takeaway.orders}
            revenue={data.takeaway.revenue}
            icon={Package}
            color="#f97316"
          />
          <StatCard
            label="Delivery"
            orders={data.delivery.orders}
            revenue={data.delivery.revenue}
            icon={Bike}
            color="#22c55e"
          />
        </div>
      </CardContent>
    </Card>
  )
}