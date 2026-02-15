'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RevenueChart from './RevenueChart';
import TopSellingItems from './TopSellingItems';
import OrderTypeChart from './OrderTypeChart';
import TodayItemsSold from './TodayItemsSold';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  UtensilsCrossed, 
  Package,
  RefreshCw,
  Clock,
  CalendarRange
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, parseISO } from 'date-fns';

type DatePeriod = 'today' | 'yesterday' | 'week' | 'month' | '3months' | 'year' | 'custom';

interface SalesData {
  summary: {
    totalRevenue: string;
    totalOrders: number;
    dineInOrders: number;
    takeawayOrders: number;
    dineInRevenue: string;
    takeawayRevenue: string;
    avgOrderValue: string;
    avgDineInValue: string;
    avgTakeawayValue: string;
  };
  todaysSummary?: {
    revenue: string;
    orders: number;
    avgOrderValue: string;
    topItem: string;
  };
  revenueTrend: Array<{
    date: string;
    total: number;
    dineIn: number;
    takeaway: number;
  }>;
  topItems: Array<{
    name: string;
    quantity: number;
    revenue: string;
  }>;
  todaysItems?: Array<{
    name: string;
    quantity: number;
    revenue: string;
    category: string;
    image?: string;
  }>;
  orderTypeDistribution: {
    dineIn: {
      count: number;
      revenue: string;
      percentage: string;
    };
    takeaway: {
      count: number;
      revenue: string;
      percentage: string;
    };
  };
}

export default function SalesDashboard() {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<DatePeriod>('today');
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Custom date range states
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

  // Auto-refresh for today's data every 30 seconds
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
          {/* Quick Period Tabs */}
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

                <Button 
                  onClick={handleCustomDateApply}
                  className="w-full md:w-auto"
                >
                  Apply Date Range
                </Button>
              </div>
              
              {/* Date Range Summary */}
              <p className="text-sm text-muted-foreground mt-2">
                Showing data from <span className="font-semibold">{format(parseISO(customStartDate), 'MMM dd, yyyy')}</span> to <span className="font-semibold">{format(parseISO(customEndDate), 'MMM dd, yyyy')}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Highlight Banner (Only for today) */}
      {isToday && data.todaysSummary && (
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">💰 Today's Revenue</p>
                <p className="text-3xl font-bold">${data.todaysSummary.revenue}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">📝 Orders</p>
                <p className="text-3xl font-bold">{data.todaysSummary.orders}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">📊 Avg Order</p>
                <p className="text-3xl font-bold">${data.todaysSummary.avgOrderValue}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">⭐ Top Item</p>
                <p className="text-xl font-bold truncate">{data.todaysSummary.topItem}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.summary.totalRevenue}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.summary.totalOrders} orders • {periodLabels[period]}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              🍽️ Dine-In
            </CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${data.summary.dineInRevenue}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.summary.dineInOrders} orders • Avg: ${data.summary.avgDineInValue}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              📦 Takeaway
            </CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${data.summary.takeawayRevenue}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.summary.takeawayOrders} orders • Avg: ${data.summary.avgTakeawayValue}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.summary.avgOrderValue}
            </div>
            <p className="text-xs text-muted-foreground">
              Per order value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Items Sold (Only for today) */}
      {isToday && data.todaysItems && data.todaysItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Today's Items Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TodayItemsSold items={data.todaysItems} />
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend Chart */}
        {data.revenueTrend.length > 1 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Trend - {periodLabels[period]}</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart data={data.revenueTrend} />
            </CardContent>
          </Card>
        )}

        {/* Order Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTypeChart data={data.orderTypeDistribution} />
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items - {periodLabels[period]}</CardTitle>
          </CardHeader>
          <CardContent>
            <TopSellingItems items={data.topItems} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}