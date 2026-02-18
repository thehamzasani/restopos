'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RevenueChart from './RevenueChart';
import OrderTypeChart from './OrderTypeChart';
import {
  DollarSign,
  TrendingUp,
  UtensilsCrossed,
  Package,
  Bike,
  RefreshCw,
  Clock,
  CalendarRange
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, parseISO } from 'date-fns';

type DatePeriod = 'today' | 'yesterday' | 'week' | 'month' | '3months' | 'year' | 'custom';

interface SalesData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalDiscount: number;
    ordersWithDiscount: number;
    dineIn: { orders: number; revenue: number };
    takeaway: { orders: number; revenue: number };
    delivery: { orders: number; revenue: number; deliveryFees: number };
  };
  paymentBreakdown: Record<string, number>;
  revenueTrend: Array<{
    date: string;
    total: number;
    dine_in: number;
    takeaway: number;
    delivery: number;
    count: number;
  }>;
  period: { startDate: string; endDate: string };
}

export default function SalesDashboard() {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<DatePeriod>('today');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const [showCustomDates, setShowCustomDates] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (period === 'custom') {
        params.append('startDate', customStartDate);
        params.append('endDate', customEndDate);
      } else {
        params.append('period', period);
      }
      const response = await fetch(`/api/reports/sales?${params}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, customStartDate, customEndDate]);

  useEffect(() => {
    if (period === 'today' && autoRefresh) {
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [period, autoRefresh]);

  const handlePeriodChange = (newPeriod: DatePeriod) => {
    setPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      setShowCustomDates(false);
    }
  };

  const handleCustomDateApply = () => {
    setPeriod('custom');
    fetchData();
  };

  const periodLabels: Record<DatePeriod, string> = {
    today: "Today",
    yesterday: "Yesterday",
    week: "Last 7 Days",
    month: "Last 30 Days",
    '3months': "Last 90 Days",
    year: "This Year",
    custom: "Custom Range"
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    );
  }

  const isToday = period === 'today';

  return (
    <div className="space-y-6">
      {/* Period Selector & Custom Date Range */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <Tabs value={period} onValueChange={(v) => handlePeriodChange(v as DatePeriod)} className="w-full lg:w-auto">
              <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
                <TabsTrigger value="week">7 Days</TabsTrigger>
                <TabsTrigger value="month">30 Days</TabsTrigger>
                <TabsTrigger value="3months">90 Days</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
                <TabsTrigger value="custom" className="gap-1">
                  <CalendarRange className="h-4 w-4" />
                  Custom
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2 w-full lg:w-auto">
              {isToday && (
                <Button
                  variant={autoRefresh ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className="gap-2 flex-1 lg:flex-none"
                >
                  <Clock className="h-4 w-4" />
                  {autoRefresh ? "Live" : "Auto-Refresh"}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={loading}
                className="gap-2 flex-1 lg:flex-none"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          {period === 'custom' && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="startDate">From Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    max={customEndDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">To Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    min={customStartDate}
                    max={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                <Button onClick={handleCustomDateApply} className="w-full md:w-auto">
                  Apply Date Range
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Showing data from <span className="font-semibold">{format(parseISO(customStartDate), 'MMM dd, yyyy')}</span> to <span className="font-semibold">{format(parseISO(customEndDate), 'MMM dd, yyyy')}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.summary.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.totalOrders} orders • {periodLabels[period]}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">🍽️ Dine-In</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${data.summary.dineIn.revenue}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.dineIn.orders} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">📦 Takeaway</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${data.summary.takeaway.revenue}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.takeaway.orders} orders
            </p>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.summary.averageOrderValue}</div>
            <p className="text-xs text-muted-foreground">Per order value</p>
          </CardContent>
        </Card> */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">🛵 Delivery</CardTitle>
            <Bike className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${data.summary.delivery.revenue}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.delivery.orders} orders • Fees: ${data.summary.delivery.deliveryFees}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Card */}
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">🛵 Delivery</CardTitle>
            <Bike className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${data.summary.delivery.revenue}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.delivery.orders} orders • Fees: ${data.summary.delivery.deliveryFees}
            </p>
          </CardContent>
        </Card>
      </div> */}

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend Chart */}
        {data.revenueTrend.length >= 1 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Trend - {periodLabels[period]}</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart data={data.revenueTrend.map(item => ({
                ...item,
                date: item.date,
                total: Number(item.total),
                dineIn: item.dine_in,
                takeaway: Number(item.takeaway),
                delivery: Number(item.delivery)
              }))} />
            </CardContent>
          </Card>
        )}

        {/* Order Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTypeChart
              data={{
                dineIn: { orders: data.summary.dineIn.orders, revenue: data.summary.dineIn.revenue },
                takeaway: { orders: data.summary.takeaway.orders, revenue: data.summary.takeaway.revenue },
                delivery: { orders: data.summary.delivery.orders, revenue: data.summary.delivery.revenue },
              }}
            />
          </CardContent>
        </Card>

        {/* Payment Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.paymentBreakdown).map(([method, amount]) => (
                <div key={method} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{method}</span>
                  <span className="text-sm font-bold">${Number(amount).toFixed(2)}</span>
                </div>
              ))}
              {Object.keys(data.paymentBreakdown).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No payment data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}