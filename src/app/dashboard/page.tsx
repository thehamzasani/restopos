// // src/app/(dashboard)/page.tsx

// import React, { Suspense, JSX } from "react"
// import { redirect } from "next/navigation"
// import Link from "next/link"
// import { auth } from "@/lib/auth"
// import prisma from "@/lib/prisma"
// import { startOfDay, endOfDay, subDays, format } from "date-fns"
// import {
//   DollarSign,
//   ShoppingCart,
//   UtensilsCrossed,
//   Package,
//   TrendingUp,
//   TrendingDown,
//   AlertTriangle,
//   Clock,
//   ChefHat,
//   CheckCircle2,
//   ArrowRight,
//   Users,
//   Table2,
//   BarChart3,
//   Settings,
// } from "lucide-react"
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Skeleton } from "@/components/ui/skeleton"

// // ─── Data Fetching ────────────────────────────────────────────────────────────

// async function getDashboardData() {
//   const today = new Date()
//   const todayStart = startOfDay(today)
//   const todayEnd = endOfDay(today)
//   const yesterdayStart = startOfDay(subDays(today, 1))
//   const yesterdayEnd = endOfDay(subDays(today, 1))

//   const [
//     todayOrders,
//     yesterdayOrders,
//     pendingOrders,
//     preparingOrders,
//     readyOrders,
//     activeTables,
//     totalTables,
//     lowStockItems,
//     recentOrders,
//     settings,
//   ] = await Promise.all([
//     // Today's completed orders
//     prisma.order.findMany({
//       where: {
//         createdAt: { gte: todayStart, lte: todayEnd },
//         status: { not: "CANCELLED" },
//       },
//       select: { total: true, orderType: true, status: true },
//     }),

//     // Yesterday's completed orders (for comparison)
//     prisma.order.findMany({
//       where: {
//         createdAt: { gte: yesterdayStart, lte: yesterdayEnd },
//         status: { not: "CANCELLED" },
//       },
//       select: { total: true },
//     }),

//     // Active orders by status
//     prisma.order.count({ where: { status: "PENDING" } }),
//     prisma.order.count({ where: { status: "PREPARING" } }),
//     prisma.order.count({ where: { status: "READY" } }),

//     // Tables
//     prisma.table.count({ where: { status: "OCCUPIED" } }),
//     prisma.table.count(),

//     // Low stock
//     prisma.inventory.findMany({
//       where: { quantity: { lte: prisma.inventory.fields.lowStockThreshold } },
//       select: { id: true, name: true, quantity: true, unit: true, lowStockThreshold: true },
//       take: 5,
//       orderBy: { quantity: "asc" },
//     }),

//     // Recent orders (last 8)
//     prisma.order.findMany({
//       orderBy: { createdAt: "desc" },
//       take: 8,
//       include: {
//         table: { select: { number: true } },
//         user: { select: { name: true } },
//         orderItems: {
//           include: { menuItem: { select: { name: true } } },
//           take: 2,
//         },
//       },
//     }),

//     // Settings for restaurant name
//     prisma.settings.findFirst(),
//   ])

//   // Compute metrics
//   const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0)
//   const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + Number(o.total), 0)
//   const revenueChange =
//     yesterdayRevenue === 0
//       ? 100
//       : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100

//   const todayOrderCount = todayOrders.length
//   const yesterdayOrderCount = yesterdayOrders.length
//   const orderCountChange =
//     yesterdayOrderCount === 0
//       ? 100
//       : ((todayOrderCount - yesterdayOrderCount) / yesterdayOrderCount) * 100

//   const dineInCount = todayOrders.filter((o) => o.orderType === "DINE_IN").length
//   const takeawayCount = todayOrders.filter((o) => o.orderType === "TAKEAWAY").length

//   const avgOrderValue = todayOrderCount > 0 ? todayRevenue / todayOrderCount : 0

//   return {
//     todayRevenue,
//     revenueChange,
//     todayOrderCount,
//     orderCountChange,
//     dineInCount,
//     takeawayCount,
//     avgOrderValue,
//     pendingOrders,
//     preparingOrders,
//     readyOrders,
//     activeTables,
//     totalTables,
//     lowStockItems,
//     recentOrders,
//     restaurantName: settings?.restaurantName ?? "My Restaurant",
//     currency: settings?.currency ?? "USD",
//   }
// }

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// function formatCurrency(amount: number, currency = "USD") {
//   return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
// }

// function getGreeting() {
//   const hour = new Date().getHours()
//   if (hour < 12) return "Good morning"
//   if (hour < 17) return "Good afternoon"
//   return "Good evening"
// }

// function statusColor(status: string) {
//   const map: Record<string, string> = {
//     PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
//     PREPARING: "bg-blue-100 text-blue-800 border-blue-200",
//     READY: "bg-green-100 text-green-800 border-green-200",
//     COMPLETED: "bg-gray-100 text-gray-700 border-gray-200",
//     CANCELLED: "bg-red-100 text-red-700 border-red-200",
//   }
//   return map[status] ?? "bg-gray-100 text-gray-700"
// }

// function statusIcon(status: string) {
//   const icons: Record<string, JSX.Element> = {
//     PENDING: <Clock className="h-3 w-3" />,
//     PREPARING: <ChefHat className="h-3 w-3" />,
//     READY: <CheckCircle2 className="h-3 w-3" />,
//     COMPLETED: <CheckCircle2 className="h-3 w-3" />,
//     CANCELLED: <AlertTriangle className="h-3 w-3" />,
//   }
//   return icons[status] ?? null
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function StatCard({
//   title,
//   value,
//   subtitle,
//   icon: Icon,
//   iconColor,
//   change,
//   changeLabel,
// }: {
//   title: string
//   value: string
//   subtitle?: string
//   icon: React.ElementType
//   iconColor: string
//   change?: number
//   changeLabel?: string
// }) {
//   const isPositive = (change ?? 0) >= 0
//   return (
//     <Card className="relative overflow-hidden">
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
//         <div className={`rounded-lg p-2 ${iconColor}`}>
//           <Icon className="h-4 w-4" />
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="text-2xl font-bold tracking-tight">{value}</div>
//         {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
//         {change !== undefined && (
//           <div
//             className={`flex items-center gap-1 mt-2 text-xs font-medium ${
//               isPositive ? "text-emerald-600" : "text-red-500"
//             }`}
//           >
//             {isPositive ? (
//               <TrendingUp className="h-3 w-3" />
//             ) : (
//               <TrendingDown className="h-3 w-3" />
//             )}
//             <span>
//               {isPositive ? "+" : ""}
//               {change.toFixed(1)}% {changeLabel ?? "vs yesterday"}
//             </span>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   )
// }

// // ─── Page ─────────────────────────────────────────────────────────────────────

// export default async function DashboardPage() {
//   const session = await auth()
//   if (!session) redirect("/login")

//   const data = await getDashboardData()

//   const activeOrdersTotal = data.pendingOrders + data.preparingOrders + data.readyOrders

//   return (
//     <div className="space-y-6 p-6">
//       {/* ── Header ── */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">
//             {getGreeting()}, {session.user.name?.split(" ")[0]} 👋
//           </h1>
//           <p className="text-muted-foreground text-sm mt-1">
//             Here's what's happening at <strong>{data.restaurantName}</strong> today,{" "}
//             {format(new Date(), "EEEE, MMMM d")}
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <Button asChild size="sm" variant="outline">
//             <Link href="/kitchen">
//               <ChefHat className="h-4 w-4 mr-2" />
//               Kitchen View
//             </Link>
//           </Button>
//           <Button asChild size="sm">
//             <Link href="/pos">
//               <ShoppingCart className="h-4 w-4 mr-2" />
//               New Order
//             </Link>
//           </Button>
//         </div>
//       </div>

//       {/* ── Today's KPI Cards ── */}
//       <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
//         <StatCard
//           title="Today's Revenue"
//           value={formatCurrency(data.todayRevenue, data.currency)}
//           icon={DollarSign}
//           iconColor="bg-emerald-100 text-emerald-600"
//           change={data.revenueChange}
//         />
//         <StatCard
//           title="Orders Today"
//           value={String(data.todayOrderCount)}
//           subtitle={`${data.dineInCount} dine-in · ${data.takeawayCount} takeaway`}
//           icon={ShoppingCart}
//           iconColor="bg-blue-100 text-blue-600"
//           change={data.orderCountChange}
//         />
//         <StatCard
//           title="Avg. Order Value"
//           value={formatCurrency(data.avgOrderValue, data.currency)}
//           subtitle="Per completed order"
//           icon={TrendingUp}
//           iconColor="bg-purple-100 text-purple-600"
//         />
//         <StatCard
//           title="Active Tables"
//           value={`${data.activeTables} / ${data.totalTables}`}
//           subtitle={`${data.totalTables - data.activeTables} tables available`}
//           icon={Table2}
//           iconColor="bg-orange-100 text-orange-600"
//         />
//       </div>

//       {/* ── Active Orders + Low Stock ── */}
//       <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">

//         {/* Active Orders Summary */}
//         <Card className="lg:col-span-1">
//           <CardHeader className="pb-3">
//             <CardTitle className="text-base flex items-center gap-2">
//               <Clock className="h-4 w-4 text-muted-foreground" />
//               Active Orders
//             </CardTitle>
//             <CardDescription>Live kitchen status</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             <Link
//               href="/orders?status=PENDING"
//               className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-100 hover:bg-yellow-100 transition-colors"
//             >
//               <div className="flex items-center gap-3">
//                 <div className="h-8 w-8 rounded-full bg-yellow-200 flex items-center justify-center">
//                   <Clock className="h-4 w-4 text-yellow-700" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-yellow-900">Pending</p>
//                   <p className="text-xs text-yellow-600">Waiting to be prepared</p>
//                 </div>
//               </div>
//               <span className="text-2xl font-bold text-yellow-700">{data.pendingOrders}</span>
//             </Link>

//             <Link
//               href="/orders?status=PREPARING"
//               className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
//             >
//               <div className="flex items-center gap-3">
//                 <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
//                   <ChefHat className="h-4 w-4 text-blue-700" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-blue-900">Preparing</p>
//                   <p className="text-xs text-blue-600">In the kitchen now</p>
//                 </div>
//               </div>
//               <span className="text-2xl font-bold text-blue-700">{data.preparingOrders}</span>
//             </Link>

//             <Link
//               href="/orders?status=READY"
//               className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-100 hover:bg-green-100 transition-colors"
//             >
//               <div className="flex items-center gap-3">
//                 <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center">
//                   <CheckCircle2 className="h-4 w-4 text-green-700" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-green-900">Ready</p>
//                   <p className="text-xs text-green-600">Ready to serve</p>
//                 </div>
//               </div>
//               <span className="text-2xl font-bold text-green-700">{data.readyOrders}</span>
//             </Link>

//             <div className="pt-1">
//               <Button asChild variant="outline" size="sm" className="w-full">
//                 <Link href="/kitchen">
//                   Go to Kitchen Display
//                   <ArrowRight className="h-4 w-4 ml-2" />
//                 </Link>
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Low Stock Alerts */}
//         <Card className="lg:col-span-1">
//           <CardHeader className="pb-3">
//             <CardTitle className="text-base flex items-center gap-2">
//               <AlertTriangle className="h-4 w-4 text-amber-500" />
//               Low Stock Alerts
//             </CardTitle>
//             <CardDescription>Items needing restock</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {data.lowStockItems.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-8 text-center">
//                 <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
//                   <CheckCircle2 className="h-6 w-6 text-green-600" />
//                 </div>
//                 <p className="text-sm font-medium text-green-700">All stock levels are good!</p>
//                 <p className="text-xs text-muted-foreground mt-1">No items need restocking</p>
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {data.lowStockItems.map((item) => {
//                   const pct = Math.min(
//                     100,
//                     (Number(item.quantity) / Number(item.lowStockThreshold)) * 100
//                   )
//                   const isCritical = Number(item.quantity) <= Number(item.lowStockThreshold) * 0.5
//                   return (
//                     <div key={item.id} className="space-y-1">
//                       <div className="flex items-center justify-between text-sm">
//                         <span className="font-medium truncate max-w-[140px]">{item.name}</span>
//                         <span
//                           className={`text-xs font-semibold ${
//                             isCritical ? "text-red-600" : "text-amber-600"
//                           }`}
//                         >
//                           {Number(item.quantity).toFixed(1)} {item.unit}
//                         </span>
//                       </div>
//                       <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
//                         <div
//                           className={`h-full rounded-full transition-all ${
//                             isCritical ? "bg-red-500" : "bg-amber-400"
//                           }`}
//                           style={{ width: `${pct}%` }}
//                         />
//                       </div>
//                     </div>
//                   )
//                 })}
//                 <div className="pt-2">
//                   <Button asChild variant="outline" size="sm" className="w-full">
//                     <Link href="/inventory">
//                       Manage Inventory
//                       <ArrowRight className="h-4 w-4 ml-2" />
//                     </Link>
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Order Type Split */}
//         <Card className="lg:col-span-1">
//           <CardHeader className="pb-3">
//             <CardTitle className="text-base flex items-center gap-2">
//               <BarChart3 className="h-4 w-4 text-muted-foreground" />
//               Today's Split
//             </CardTitle>
//             <CardDescription>Dine-in vs Takeaway</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {data.todayOrderCount === 0 ? (
//               <div className="flex flex-col items-center justify-center py-8 text-center">
//                 <p className="text-sm text-muted-foreground">No orders yet today</p>
//               </div>
//             ) : (
//               <>
//                 {/* Visual bar */}
//                 <div className="h-4 rounded-full overflow-hidden flex bg-gray-100">
//                   {data.dineInCount > 0 && (
//                     <div
//                       className="bg-blue-500 h-full transition-all"
//                       style={{
//                         width: `${(data.dineInCount / data.todayOrderCount) * 100}%`,
//                       }}
//                     />
//                   )}
//                   {data.takeawayCount > 0 && (
//                     <div
//                       className="bg-orange-400 h-full transition-all"
//                       style={{
//                         width: `${(data.takeawayCount / data.todayOrderCount) * 100}%`,
//                       }}
//                     />
//                   )}
//                 </div>

//                 {/* Legend */}
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
//                     <div className="flex items-center gap-2 mb-1">
//                       <UtensilsCrossed className="h-4 w-4 text-blue-600" />
//                       <span className="text-xs font-medium text-blue-800">Dine-In</span>
//                     </div>
//                     <p className="text-2xl font-bold text-blue-700">{data.dineInCount}</p>
//                     <p className="text-xs text-blue-600">
//                       {data.todayOrderCount > 0
//                         ? ((data.dineInCount / data.todayOrderCount) * 100).toFixed(0)
//                         : 0}
//                       % of orders
//                     </p>
//                   </div>
//                   <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
//                     <div className="flex items-center gap-2 mb-1">
//                       <Package className="h-4 w-4 text-orange-600" />
//                       <span className="text-xs font-medium text-orange-800">Takeaway</span>
//                     </div>
//                     <p className="text-2xl font-bold text-orange-700">{data.takeawayCount}</p>
//                     <p className="text-xs text-orange-600">
//                       {data.todayOrderCount > 0
//                         ? ((data.takeawayCount / data.todayOrderCount) * 100).toFixed(0)
//                         : 0}
//                       % of orders
//                     </p>
//                   </div>
//                 </div>

//                 <Button asChild variant="outline" size="sm" className="w-full">
//                   <Link href="/reports">
//                     View Full Reports
//                     <ArrowRight className="h-4 w-4 ml-2" />
//                   </Link>
//                 </Button>
//               </>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* ── Recent Orders ── */}
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between pb-3">
//           <div>
//             <CardTitle className="text-base">Recent Orders</CardTitle>
//             <CardDescription>Latest 8 orders across all types</CardDescription>
//           </div>
//           <Button asChild variant="ghost" size="sm">
//             <Link href="/orders">
//               View all
//               <ArrowRight className="h-4 w-4 ml-1" />
//             </Link>
//           </Button>
//         </CardHeader>
//         <CardContent>
//           {data.recentOrders.length === 0 ? (
//             <div className="text-center py-10">
//               <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
//               <p className="text-sm text-muted-foreground">No orders yet</p>
//               <Button asChild size="sm" className="mt-4">
//                 <Link href="/pos">Create First Order</Link>
//               </Button>
//             </div>
//           ) : (
//             <div className="divide-y">
//               {data.recentOrders.map((order) => {
//                 const isDineIn = order.orderType === "DINE_IN"
//                 const itemNames = order.orderItems.map((i) => i.menuItem.name).join(", ")
//                 const moreItems = order.orderItems.length < (order as any)._count?.orderItems
//                   ? ` +${(order as any)._count.orderItems - order.orderItems.length} more`
//                   : ""

//                 return (
//                   <Link
//                     key={order.id}
//                     href={`/orders/${order.id}`}
//                     className="flex items-center justify-between py-3 hover:bg-muted/30 px-2 -mx-2 rounded-lg transition-colors group"
//                   >
//                     <div className="flex items-center gap-3 min-w-0">
//                       {/* Order type icon */}
//                       <div
//                         className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
//                           isDineIn
//                             ? "bg-blue-100 text-blue-600"
//                             : "bg-orange-100 text-orange-600"
//                         }`}
//                       >
//                         {isDineIn ? (
//                           <UtensilsCrossed className="h-4 w-4" />
//                         ) : (
//                           <Package className="h-4 w-4" />
//                         )}
//                       </div>

//                       {/* Info */}
//                       <div className="min-w-0">
//                         <div className="flex items-center gap-2 flex-wrap">
//                           <span className="text-sm font-semibold">
//                             #{order.orderNumber}
//                           </span>
//                           <span className="text-xs text-muted-foreground">
//                             {isDineIn
//                               ? order.table
//                                 ? `Table ${order.table.number}`
//                                 : "Dine-In"
//                               : (order as any).customerName || "Takeaway"}
//                           </span>
//                         </div>
//                         <p className="text-xs text-muted-foreground truncate max-w-[260px]">
//                           {itemNames}
//                           {moreItems}
//                         </p>
//                       </div>
//                     </div>

//                     {/* Right side */}
//                     <div className="flex items-center gap-3 shrink-0 ml-2">
//                       <div className="text-right hidden sm:block">
//                         <p className="text-sm font-semibold">
//                           {formatCurrency(Number(order.total), data.currency)}
//                         </p>
//                         <p className="text-xs text-muted-foreground">
//                           {format(new Date(order.createdAt), "HH:mm")}
//                         </p>
//                       </div>
//                       <span
//                         className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColor(
//                           order.status
//                         )}`}
//                       >
//                         {statusIcon(order.status)}
//                         {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
//                       </span>
//                     </div>
//                   </Link>
//                 )
//               })}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* ── Quick Access ── */}
//       <div>
//         <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
//           Quick Access
//         </h2>
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
//           {[
//             { href: "/pos", icon: ShoppingCart, label: "New Order", color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
//             { href: "/orders", icon: Clock, label: "Orders", color: "text-yellow-600 bg-yellow-50 hover:bg-yellow-100" },
//             { href: "/kitchen", icon: ChefHat, label: "Kitchen", color: "text-orange-600 bg-orange-50 hover:bg-orange-100" },
//             { href: "/menu", icon: UtensilsCrossed, label: "Menu", color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
//             { href: "/inventory", icon: Package, label: "Inventory", color: "text-red-600 bg-red-50 hover:bg-red-100" },
//             { href: "/reports", icon: BarChart3, label: "Reports", color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" },
//           ].map(({ href, icon: Icon, label, color }) => (
//             <Link key={href} href={href}>
//               <div
//                 className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-transparent transition-all cursor-pointer ${color}`}
//               >
//                 <Icon className="h-6 w-6" />
//                 <span className="text-xs font-medium">{label}</span>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }
// src/app/(dashboard)/page.tsx

import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { startOfDay, endOfDay, subDays, format } from "date-fns"
import {
  DollarSign,
  ShoppingCart,
  UtensilsCrossed,
  Package,
  Truck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  ChefHat,
  CheckCircle2,
  ArrowRight,
  Table2,
  BarChart3,
  MapPin,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function getDashboardData() {
  const today = new Date()
  const todayStart = startOfDay(today)
  const todayEnd = endOfDay(today)
  const yesterdayStart = startOfDay(subDays(today, 1))
  const yesterdayEnd = endOfDay(subDays(today, 1))

  // ✅ Sequential — no Promise.all() for Supabase PgBouncer compatibility
  const todayOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: todayStart, lte: todayEnd },
      status: { not: "CANCELLED" },
    },
    select: { total: true, orderType: true, deliveryFee: true },
  })

  const yesterdayOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: yesterdayStart, lte: yesterdayEnd },
      status: { not: "CANCELLED" },
    },
    select: { total: true },
  })

  const pendingOrders = await prisma.order.count({ where: { status: "PENDING" } })
  const preparingOrders = await prisma.order.count({ where: { status: "PREPARING" } })
  const readyOrders = await prisma.order.count({ where: { status: "READY" } })
  const outForDeliveryOrders = await prisma.order.count({ where: { status: "OUT_FOR_DELIVERY" } })
  const activeTables = await prisma.table.count({ where: { status: "OCCUPIED" } })
  const totalTables = await prisma.table.count()

  const lowStockItems = await prisma.inventory.findMany({
    where: { quantity: { lte: prisma.inventory.fields.lowStockThreshold } },
    select: { id: true, name: true, quantity: true, unit: true, lowStockThreshold: true },
    take: 5,
    orderBy: { quantity: "asc" },
  })

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      table: { select: { number: true } },
      user: { select: { name: true } },
      orderItems: {
        include: { menuItem: { select: { name: true } } },
        take: 2,
      },
    },
  })

  const settings = await prisma.settings.findFirst()
  

  // ── Derived metrics ──
  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total), 0)
  const yesterdayRevenue = yesterdayOrders.reduce((s, o) => s + Number(o.total), 0)
  const revenueChange =
    yesterdayRevenue === 0
      ? 100
      : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100

  const todayOrderCount = todayOrders.length
  const yesterdayOrderCount = yesterdayOrders.length
  const orderCountChange =
    yesterdayOrderCount === 0
      ? 100
      : ((todayOrderCount - yesterdayOrderCount) / yesterdayOrderCount) * 100

  const dineInOrders = todayOrders.filter((o) => o.orderType === "DINE_IN")
  const takeawayOrders = todayOrders.filter((o) => o.orderType === "TAKEAWAY")
  const deliveryOrders = todayOrders.filter((o) => o.orderType === "DELIVERY")

  const dineInRevenue = dineInOrders.reduce((s, o) => s + Number(o.total), 0)
  const takeawayRevenue = takeawayOrders.reduce((s, o) => s + Number(o.total), 0)
  const deliveryRevenue = deliveryOrders.reduce((s, o) => s + Number(o.total), 0)
  const totalDeliveryFees = deliveryOrders.reduce((s, o) => s + Number(o.deliveryFee ?? 0), 0)

  const avgOrderValue = todayOrderCount > 0 ? todayRevenue / todayOrderCount : 0

  return {
    todayRevenue,
    revenueChange,
    todayOrderCount,
    orderCountChange,
    avgOrderValue,
    dineInCount: dineInOrders.length,
    takeawayCount: takeawayOrders.length,
    deliveryCount: deliveryOrders.length,
    dineInRevenue,
    takeawayRevenue,
    deliveryRevenue,
    totalDeliveryFees,
    pendingOrders,
    preparingOrders,
    readyOrders,
    outForDeliveryOrders,
    activeTables,
    totalTables,
    lowStockItems,
    recentOrders,
    restaurantName: settings?.restaurantName ?? "My Restaurant",
    currency: settings?.currency ?? "USD",
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PREPARING: "bg-blue-100 text-blue-800 border-blue-200",
  READY: "bg-green-100 text-green-800 border-green-200",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800 border-purple-200",
  COMPLETED: "bg-gray-100 text-gray-700 border-gray-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-3 w-3" />,
  PREPARING: <ChefHat className="h-3 w-3" />,
  READY: <CheckCircle2 className="h-3 w-3" />,
  OUT_FOR_DELIVERY: <Truck className="h-3 w-3" />,
  COMPLETED: <CheckCircle2 className="h-3 w-3" />,
  CANCELLED: <AlertTriangle className="h-3 w-3" />,
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    PENDING: "Pending",
    PREPARING: "Preparing",
    READY: "Ready",
    OUT_FOR_DELIVERY: "On the way",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  }
  return map[s] ?? s
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  change,
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ElementType
  iconColor: string
  change?: number
}) {
  const up = (change ?? 0) >= 0
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`rounded-lg p-2 ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 mt-2 text-xs font-medium ${up ? "text-emerald-600" : "text-red-500"
              }`}
          >
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {up ? "+" : ""}{change.toFixed(1)}% vs yesterday
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const d = await getDashboardData()
  const totalActive =
    d.pendingOrders + d.preparingOrders + d.readyOrders + d.outForDeliveryOrders

  return (
    <div className="space-y-6 p-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {getGreeting()}, {session.user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s what&apos;s happening at <strong>{d.restaurantName}</strong> today,{" "}
            {format(new Date(), "EEEE, MMMM d")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/kitchen">
              <ChefHat className="h-4 w-4 mr-2" />
              Kitchen View
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/pos">
              <ShoppingCart className="h-4 w-4 mr-2" />
              New Order
            </Link>
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Revenue"
          value={fmt(d.todayRevenue, d.currency)}
          icon={DollarSign}
          iconColor="bg-emerald-100 text-emerald-600"
          change={d.revenueChange}
        />
        <StatCard
          title="Orders Today"
          value={String(d.todayOrderCount)}
          subtitle={`${d.dineInCount} dine-in · ${d.takeawayCount} takeaway · ${d.deliveryCount} delivery`}
          icon={ShoppingCart}
          iconColor="bg-blue-100 text-blue-600"
          change={d.orderCountChange}
        />
        <StatCard
          title="Avg. Order Value"
          value={fmt(d.avgOrderValue, d.currency)}
          subtitle="Per completed order"
          icon={TrendingUp}
          iconColor="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Active Tables"
          value={`${d.activeTables} / ${d.totalTables}`}
          subtitle={`${d.totalTables - d.activeTables} tables available`}
          icon={Table2}
          iconColor="bg-orange-100 text-orange-600"
        />
      </div>

      {/* ── Middle Row ── */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">

        {/* Active Orders */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Active Orders
              {totalActive > 0 && (
                <span className="ml-auto text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {totalActive} live
                </span>
              )}
            </CardTitle>
            <CardDescription>Live kitchen &amp; delivery status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">

            <Link
              href="/orders?status=PENDING"
              className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-100 hover:bg-yellow-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-yellow-200 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-yellow-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-900">Pending</p>
                  <p className="text-xs text-yellow-600">Waiting to be prepared</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-700">{d.pendingOrders}</span>
            </Link>

            <Link
              href="/orders?status=PREPARING"
              className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
                  <ChefHat className="h-4 w-4 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Preparing</p>
                  <p className="text-xs text-blue-600">In the kitchen now</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-700">{d.preparingOrders}</span>
            </Link>

            <Link
              href="/orders?status=READY"
              className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-100 hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">Ready</p>
                  <p className="text-xs text-green-600">Ready to serve / dispatch</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-700">{d.readyOrders}</span>
            </Link>

            <Link
              href="/orders?status=OUT_FOR_DELIVERY"
              className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-900">Out for Delivery</p>
                  <p className="text-xs text-purple-600">On the way to customer</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-700">
                {d.outForDeliveryOrders}
              </span>
            </Link>

            <div className="pt-1">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/kitchen">
                  Go to Kitchen Display
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Items needing restock</CardDescription>
          </CardHeader>
          <CardContent>
            {d.lowStockItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-700">All stock levels are good!</p>
                <p className="text-xs text-muted-foreground mt-1">No items need restocking</p>
              </div>
            ) : (
              <div className="space-y-3">
                {d.lowStockItems.map((item) => {
                  const pct = Math.min(
                    100,
                    (Number(item.quantity) / Number(item.lowStockThreshold)) * 100
                  )
                  const isCritical =
                    Number(item.quantity) <= Number(item.lowStockThreshold) * 0.5
                  return (
                    <div key={item.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate max-w-[140px]">{item.name}</span>
                        <span
                          className={`text-xs font-semibold ${isCritical ? "text-red-600" : "text-amber-600"
                            }`}
                        >
                          {Number(item.quantity).toFixed(1)} {item.unit}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isCritical ? "bg-red-500" : "bg-amber-400"
                            }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                <div className="pt-1">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/inventory">
                      Manage Inventory
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Type Split — 3-way */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Today&apos;s Split
            </CardTitle>
            <CardDescription>Revenue by order type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {d.todayOrderCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">No orders yet today</p>
              </div>
            ) : (
              <>
                {/* Stacked proportion bar */}
                <div className="h-3 rounded-full overflow-hidden flex bg-gray-100">
                  {d.dineInCount > 0 && (
                    <div
                      className="bg-blue-500 h-full"
                      style={{ width: `${(d.dineInCount / d.todayOrderCount) * 100}%` }}
                    />
                  )}
                  {d.takeawayCount > 0 && (
                    <div
                      className="bg-orange-400 h-full"
                      style={{ width: `${(d.takeawayCount / d.todayOrderCount) * 100}%` }}
                    />
                  )}
                  {d.deliveryCount > 0 && (
                    <div
                      className="bg-purple-500 h-full"
                      style={{ width: `${(d.deliveryCount / d.todayOrderCount) * 100}%` }}
                    />
                  )}
                </div>

                {/* Three type rows */}
                <div className="grid grid-cols-1 gap-2">
                  {/* Dine-In */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="h-4 w-4 text-blue-600 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-blue-900">Dine-In</p>
                        <p className="text-xs text-blue-600">
                          {d.dineInCount} orders ·{" "}
                          {d.todayOrderCount > 0
                            ? ((d.dineInCount / d.todayOrderCount) * 100).toFixed(0)
                            : 0}%
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-blue-700">
                      {fmt(d.dineInRevenue, d.currency)}
                    </p>
                  </div>

                  {/* Takeaway */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-orange-50 border border-orange-100">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-orange-600 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-orange-900">Takeaway</p>
                        <p className="text-xs text-orange-600">
                          {d.takeawayCount} orders ·{" "}
                          {d.todayOrderCount > 0
                            ? ((d.takeawayCount / d.todayOrderCount) * 100).toFixed(0)
                            : 0}%
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-orange-700">
                      {fmt(d.takeawayRevenue, d.currency)}
                    </p>
                  </div>

                  {/* Delivery */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-50 border border-purple-100">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-purple-600 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-purple-900">Delivery</p>
                        <p className="text-xs text-purple-600">
                          {d.deliveryCount} orders ·{" "}
                          {d.todayOrderCount > 0
                            ? ((d.deliveryCount / d.todayOrderCount) * 100).toFixed(0)
                            : 0}%
                          {d.totalDeliveryFees > 0 &&
                            ` · fees ${fmt(d.totalDeliveryFees, d.currency)}`}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-purple-700">
                      {fmt(d.deliveryRevenue, d.currency)}
                    </p>
                  </div>
                </div>

                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/reports">
                    View Full Reports
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Orders ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <CardDescription>
              Latest 8 orders — dine-in, takeaway &amp; delivery
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/orders">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {d.recentOrders.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground">No orders yet</p>
              <Button asChild size="sm" className="mt-4">
                <Link href="/pos">Create First Order</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {d.recentOrders.map((order) => {
                const isDineIn = order.orderType === "DINE_IN"
                const isDelivery = order.orderType === "DELIVERY"

                const typeIcon = isDineIn ? (
                  <UtensilsCrossed className="h-4 w-4" />
                ) : isDelivery ? (
                  <Truck className="h-4 w-4" />
                ) : (
                  <Package className="h-4 w-4" />
                )

                const typeColor = isDineIn
                  ? "bg-blue-100 text-blue-600"
                  : isDelivery
                    ? "bg-purple-100 text-purple-600"
                    : "bg-orange-100 text-orange-600"

                const locationLabel = isDineIn
                  ? order.table
                    ? `Table ${order.table.number}`
                    : "Dine-In"
                  : isDelivery
                    ? (order as any).customerName
                      ? `${(order as any).customerName} · Delivery`
                      : "Delivery"
                    : (order as any).customerName || "Takeaway"

                const deliveryAddr = (order as any).deliveryAddress as string | null
                const itemNames = order.orderItems
                  .map((i) => i.menuItem.name)
                  .join(", ")

                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between py-3 hover:bg-muted/30 px-2 -mx-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${typeColor}`}
                      >
                        {typeIcon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold">
                            #{order.orderNumber}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {locationLabel}
                          </span>
                          {isDelivery && deliveryAddr && (
                            <span className="hidden md:flex items-center gap-0.5 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {deliveryAddr.length > 30
                                ? deliveryAddr.slice(0, 30) + "…"
                                : deliveryAddr}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate max-w-[260px]">
                          {itemNames}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold">
                          {fmt(Number(order.total), d.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.createdAt), "HH:mm")}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {STATUS_ICONS[order.status]}
                        {statusLabel(order.status)}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Quick Access ── */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              href: "/dashboard/pos",
              icon: ShoppingCart,
              label: "New Order",
              color: "text-blue-600 bg-blue-50 hover:bg-blue-100",
            },
            {
              href: "/dashboard/orders",
              icon: Clock,
              label: "Orders",
              color: "text-yellow-600 bg-yellow-50 hover:bg-yellow-100",
            },
            {
              href: "/dashboard/kitchen",
              icon: ChefHat,
              label: "Kitchen",
              color: "text-orange-600 bg-orange-50 hover:bg-orange-100",
            },
            {
              href: "/dashboard/menu",
              icon: UtensilsCrossed,
              label: "Menu",
              color: "text-purple-600 bg-purple-50 hover:bg-purple-100",
            },
            {
              href: "/dashboard/inventory",
              icon: Package,
              label: "Inventory",
              color: "text-red-600 bg-red-50 hover:bg-red-100",
            },
            {
              href: "/dashboard/reports",
              icon: BarChart3,
              label: "Reports",
              color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100",
            },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href}>
              <div
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-transparent transition-all cursor-pointer ${color}`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}