import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { 
  startOfDay, 
  endOfDay, 
  subDays, 
  startOfYesterday, 
  endOfYesterday, 
  parseISO,
  eachDayOfInterval,
  format
} from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let start: Date;
    let end: Date;

    // Check if custom date range is provided
    if (startDateParam && endDateParam) {
      start = startOfDay(parseISO(startDateParam));
      end = endOfDay(parseISO(endDateParam));
    } else {
      // Use period-based calculation
      switch (period) {
        case 'today':
          start = startOfDay(new Date());
          end = endOfDay(new Date());
          break;
        case 'yesterday':
          // SPECIAL CASE: For yesterday, include today to show trend
          start = startOfYesterday();
          end = endOfDay(new Date()); // Include today for comparison
          break;
        case 'week':
          start = startOfDay(subDays(new Date(), 6)); // Last 7 days including today
          end = endOfDay(new Date());
          break;
        case 'month':
          start = startOfDay(subDays(new Date(), 29)); // Last 30 days
          end = endOfDay(new Date());
          break;
        case '3months':
          start = startOfDay(subDays(new Date(), 89)); // Last 90 days
          end = endOfDay(new Date());
          break;
        case 'year':
          start = startOfDay(subDays(new Date(), 364)); // Last 365 days
          end = endOfDay(new Date());
          break;
        default:
          start = startOfDay(new Date());
          end = endOfDay(new Date());
      }
    }

    console.log(`Fetching orders from ${start.toISOString()} to ${end.toISOString()}`);

    // Fetch orders
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: 'COMPLETED', // Only completed orders
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`Found ${orders.length} orders`);

    // Calculate summary (for the main period, excluding today if viewing yesterday)
    let summaryOrders = orders;
    if (period === 'yesterday') {
      // For summary cards, only count yesterday's orders
      summaryOrders = orders.filter(o => {
        const orderDate = format(o.createdAt, 'yyyy-MM-dd');
        const yesterdayDate = format(startOfYesterday(), 'yyyy-MM-dd');
        return orderDate === yesterdayDate;
      });
    }

    const totalRevenue = summaryOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const dineInOrders = summaryOrders.filter(o => o.orderType === 'DINE_IN');
    const takeawayOrders = summaryOrders.filter(o => o.orderType === 'TAKEAWAY');
    const dineInRevenue = dineInOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const takeawayRevenue = takeawayOrders.reduce((sum, order) => sum + Number(order.total), 0);

    const avgOrderValue = summaryOrders.length > 0 ? totalRevenue / summaryOrders.length : 0;
    const avgDineInValue = dineInOrders.length > 0 ? dineInRevenue / dineInOrders.length : 0;
    const avgTakeawayValue = takeawayOrders.length > 0 ? takeawayRevenue / takeawayOrders.length : 0;

    // FIXED: Generate revenue trend with ALL dates in range
    // For yesterday view: This will include both yesterday AND today (2 data points)
    const allDates = eachDayOfInterval({ start, end });
    
    // Initialize with zero values for all dates
    const revenueByDate: Record<string, { 
      date: string; 
      total: number; 
      dineIn: number; 
      takeaway: number; 
    }> = {};

    // First, create entries for ALL dates with zero values
    allDates.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      revenueByDate[dateKey] = {
        date: dateKey,
        total: 0,
        dineIn: 0,
        takeaway: 0,
      };
    });

    // Then, fill in actual order data (includes all orders in range)
    orders.forEach(order => {
      const dateKey = format(order.createdAt, 'yyyy-MM-dd');
      
      const amount = Number(order.total);
      revenueByDate[dateKey].total += amount;
      
      if (order.orderType === 'DINE_IN') {
        revenueByDate[dateKey].dineIn += amount;
      } else {
        revenueByDate[dateKey].takeaway += amount;
      }
    });

    const revenueTrend = Object.values(revenueByDate).sort((a, b) => 
      a.date.localeCompare(b.date)
    );

    console.log(`Revenue trend has ${revenueTrend.length} days (period: ${period})`);

    // Top-selling items (use all orders in range)
    const itemSales: Record<string, { 
      name: string; 
      quantity: number; 
      revenue: number;
      category: string;
      image?: string;
    }> = {};

    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const key = item.menuItemId;
        
        if (!itemSales[key]) {
          itemSales[key] = {
            name: item.menuItem.name,
            quantity: 0,
            revenue: 0,
            category: item.menuItem.category?.name || 'Uncategorized',
            image: item.menuItem.image || undefined,
          };
        }

        itemSales[key].quantity += item.quantity;
        itemSales[key].revenue += Number(item.subtotal);
      });
    });

    const topItems = Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(item => ({
        name: item.name,
        quantity: item.quantity,
        revenue: item.revenue.toFixed(2),
        category: item.category,
        image: item.image,
      }));

    // Today's summary (only if viewing today)
    let todaysSummary = undefined;
    let todaysItems = undefined;

    if (period === 'today' || (startDateParam && format(parseISO(startDateParam), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))) {
      const todayRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const todayOrders = orders.length;
      const todayAvg = todayOrders > 0 ? todayRevenue / todayOrders : 0;
      const topItemToday = topItems[0]?.name || 'N/A';

      todaysSummary = {
        revenue: todayRevenue.toFixed(2),
        orders: todayOrders,
        avgOrderValue: todayAvg.toFixed(2),
        topItem: topItemToday,
      };

      todaysItems = topItems.slice(0, 5); // Top 5 items for today
    }

    // Order type distribution (use summary orders for yesterday)
    const orderTypeDistribution = {
      dineIn: {
        count: dineInOrders.length,
        revenue: dineInRevenue.toFixed(2),
        percentage: summaryOrders.length > 0 
          ? ((dineInOrders.length / summaryOrders.length) * 100).toFixed(1)
          : '0',
      },
      takeaway: {
        count: takeawayOrders.length,
        revenue: takeawayRevenue.toFixed(2),
        percentage: summaryOrders.length > 0
          ? ((takeawayOrders.length / summaryOrders.length) * 100).toFixed(1)
          : '0',
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue: totalRevenue.toFixed(2),
          totalOrders: summaryOrders.length,
          dineInOrders: dineInOrders.length,
          takeawayOrders: takeawayOrders.length,
          dineInRevenue: dineInRevenue.toFixed(2),
          takeawayRevenue: takeawayRevenue.toFixed(2),
          avgOrderValue: avgOrderValue.toFixed(2),
          avgDineInValue: avgDineInValue.toFixed(2),
          avgTakeawayValue: avgTakeawayValue.toFixed(2),
        },
        todaysSummary,
        revenueTrend,
        topItems,
        todaysItems,
        orderTypeDistribution,
      },
    });
  } catch (error) {
    console.error('Error in sales report:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sales report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}