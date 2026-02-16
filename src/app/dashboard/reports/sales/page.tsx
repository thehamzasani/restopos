'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import SalesReportTable from '@/components/reports/SalesReportTable';
import { exportSalesReport } from '@/lib/export-csv';
import {
    Download,
    FileText,
    RefreshCw,
    Filter,
    ArrowLeft,
    ChevronLeft
} from 'lucide-react';
import {
    subDays,
    startOfDay,
    endOfDay,
    format,
    startOfYesterday,
    endOfYesterday
} from 'date-fns';
import { useRouter } from 'next/navigation';

type DatePeriod = 'today' | 'yesterday' | 'week' | 'month' | '3months' | 'year' | 'custom';
type OrderTypeFilter = 'ALL' | 'DINE_IN' | 'TAKEAWAY';
type PaymentFilter = 'ALL' | 'CASH' | 'CARD' | 'UPI' | 'OTHER';
type StatusFilter = 'ALL' | 'COMPLETED' | 'CANCELLED';

interface Order {
    id: string;
    orderNumber: string;
    orderType: 'DINE_IN' | 'TAKEAWAY';
    tableId?: string;
    customerName?: string;
    total: string;
    subtotal: string;
    tax: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
    itemCount: number;
}

export default function DetailedSalesReport() {
    const router = useRouter();
    const [period, setPeriod] = useState<DatePeriod>('today');
    const [customStartDate, setCustomStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
    const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [orderTypeFilter, setOrderTypeFilter] = useState<OrderTypeFilter>('ALL');
    const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('ALL');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, [period, customStartDate, customEndDate, orderTypeFilter, paymentFilter, statusFilter]);

    // IMPORTANT: Use SAME date calculation as main sales API
    const getDateRange = (period: DatePeriod) => {
        const now = new Date();
        const today = startOfDay(now);

        if (period === 'custom') {
            return {
                start: new Date(customStartDate),
                end: new Date(customEndDate)
            };
        }

        switch (period) {
            case 'today':
                return {
                    start: today,
                    end: endOfDay(now)
                };
            case 'yesterday':
                // FIXED: Only fetch yesterday's data (not today)
                // This matches the main dashboard summary cards
                return {
                    start: startOfYesterday(),
                    end: endOfYesterday()
                };
            case 'week':
                return {
                    start: subDays(today, 6), // Last 7 days including today
                    end: endOfDay(now)
                };
            case 'month':
                return {
                    start: subDays(today, 29), // Last 30 days
                    end: endOfDay(now)
                };
            case '3months':
                return {
                    start: subDays(today, 89), // Last 90 days
                    end: endOfDay(now)
                };
            case 'year':
                return {
                    start: subDays(today, 364), // Last 365 days
                    end: endOfDay(now)
                };
            default:
                return {
                    start: today,
                    end: endOfDay(now)
                };
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { start, end } = getDateRange(period);

            console.log(`[Detailed Sales Page] Fetching from ${start.toISOString()} to ${end.toISOString()}`);

            const params = new URLSearchParams({
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                orderType: orderTypeFilter,
                detailed: 'true'
            });

            if (paymentFilter !== 'ALL') {
                params.append('paymentMethod', paymentFilter);
            }
            if (statusFilter !== 'ALL') {
                params.append('status', statusFilter);
            } else {
                // Default to COMPLETED like main API
                params.append('status', 'COMPLETED');
            }

            const response = await fetch(`/api/reports/sales/detailed?${params}`);
            const data = await response.json();

            if (data.success) {
                setOrders(data.data.orders || []);
                console.log(`[Detailed Sales Page] Loaded ${data.data.orders.length} orders, Total Revenue: $${data.data.totalRevenue}`);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        exportSalesReport(orders);
    };

    const handleViewOrder = (orderId: string) => {
        router.push(`/dashboard/orders/${orderId}`);
    };

    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    const periodLabels: Record<DatePeriod, string> = {
        today: "Today",
        yesterday: "Yesterday",
        week: "Last 7 Days",
        month: "Last 30 Days",
        '3months': "Last 90 Days",
        year: "Last Year",
        custom: "Custom Range"
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/dashboard/reports')}
                        className="hover:bg-accent"
                    >
                        <ChevronLeft className="h-5 w-5 mr-1" />
                      
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <FileText className="h-8 w-8" />
                            Detailed Sales Report
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            View and export complete sales data
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchOrders} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={handleExport} disabled={orders.length === 0}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Date Period Tabs */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Time Period</label>
                        <Tabs value={period} onValueChange={(v) => setPeriod(v as DatePeriod)}>
                            <TabsList className="grid w-full grid-cols-7">
                                <TabsTrigger value="today">Today</TabsTrigger>
                                <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
                                <TabsTrigger value="week">7 Days</TabsTrigger>
                                <TabsTrigger value="month">30 Days</TabsTrigger>
                                <TabsTrigger value="3months">90 Days</TabsTrigger>
                                <TabsTrigger value="year">1 Year</TabsTrigger>
                                <TabsTrigger value="custom">Custom</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Custom Date Range */}
                    {period === 'custom' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
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
                        </div>
                    )}

                    {/* Other Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Order Type</label>
                            <Select value={orderTypeFilter} onValueChange={(v) => setOrderTypeFilter(v as OrderTypeFilter)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Orders</SelectItem>
                                    <SelectItem value="DINE_IN">Dine-In Only</SelectItem>
                                    <SelectItem value="TAKEAWAY">Takeaway Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Payment Method</label>
                            <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as PaymentFilter)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Methods</SelectItem>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="CARD">Card</SelectItem>
                                    <SelectItem value="UPI">UPI</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Status</label>
                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Period Info */}
                    <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                            📅 Showing: <span className="font-semibold">{periodLabels[period]}</span>
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{orders.length}</div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">${averageOrderValue.toFixed(2)}</div>
                        <p className="text-sm text-muted-foreground">Average Order Value</p>
                    </CardContent>
                </Card>
            </div>

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Orders ({orders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                            <p className="mt-2 text-muted-foreground">Loading orders...</p>
                        </div>
                    ) : (
                        <SalesReportTable orders={orders} onViewOrder={handleViewOrder} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}