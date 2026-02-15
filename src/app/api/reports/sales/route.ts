import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay, subDays, startOfYear, startOfYesterday, endOfYesterday, parseISO } from 'date-fns';

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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let start: Date;
    let end: Date;

    // Check if custom date range is provided
    if (startDate && endDate) {
      start = startOfDay(parseISO(startDate));
      end = endOfDay(parseISO(endDate));
    } else {
      // Use period-based calculation
      switch (period) {
        case 'today':
          start = startOfDay(new Date());
          end = endOfDay(new Date());
          break;
        case 'yesterday':
          start = startOfYesterday();
          end = endOfYesterday();
          break;
        case 'week':
          start = startOfDay(subDays(new Date(), 6));
          end = endOfDay(new Date());
          break;
        case 'month':
          start = startOfDay(subDays(new Date(), 29));
          end = endOfDay(new Date());
          break;
        case '3months':
          start = startOfDay(subDays(new Date(), 89));
          end = endOfDay(new Date());
          break;
        case 'year':
          start = startOfYear(new Date());
          end = endOfDay(new Date());
          break;
        default:
          start = startOfDay(new Date());
          end = endOfDay(new Date());
      }
    }

    // Build where clause
    const where: any = {
      createdAt: {
        gte: start,
        lte: end,
      },
      status: {
        in: ['COMPLETED', 'READY'],
      },
      paymentStatus: 'PAID',
    };

    // Get all orders
    const orders = await prisma.order.findMany({
      where,
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
        table: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate summary statistics
    const totalRevenue = orders.reduce((sum, order) => 
      sum + Number(order.total), 0
    );

    const dineInOrders = orders.filter(o => o.orderType === 'DINE_IN');
    const takeawayOrders = orders.filter(o => o.orderType === 'TAKEAWAY');

    const dineInRevenue = dineInOrders.reduce((sum, order) => 
      sum + Number(order.total), 0
    );

    const takeawayRevenue = takeawayOrders.reduce((sum, order) => 
      sum + Number(order.total), 0
    );

    const avgOrderValue = orders.length > 0 
      ? totalRevenue / orders.length 
      : 0;

    const avgDineInValue = dineInOrders.length > 0
      ? dineInRevenue / dineInOrders.length
      : 0;

    const avgTakeawayValue = takeawayOrders.length > 0
      ? takeawayRevenue / takeawayOrders.length
      : 0;

    // Group by date for trend chart
    const revenueByDate: Record<string, { 
      date: string; 
      total: number; 
      dineIn: number; 
      takeaway: number; 
    }> = {};

    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      
      if (!revenueByDate[dateKey]) {
        revenueByDate[dateKey] = {
          date: dateKey,
          total: 0,
          dineIn: 0,
          takeaway: 0,
        };
      }

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

    // Top-selling items (for the period)
    const itemSales: Record<string, { 
      name: string; 
      quantity: number; 
      revenue: number;
      category: string;
      image: string | null;
    }> = {};

    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const key = item.menuItemId;
        
        if (!itemSales[key]) {
          itemSales[key] = {
            name: item.menuItem.name,
            quantity: 0,
            revenue: 0,
            category: item.menuItem.category.name,
            image: item.menuItem.image,
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
      }));

    // Today's specific data (only for 'today' period)
    let todaysSummary = undefined;
    let todaysItems = undefined;

    const isToday = period === 'today' || 
                    (startDate === endDate && startDate === new Date().toISOString().split('T')[0]);

    if (isToday) {
      const topItemToday = Object.values(itemSales)
        .sort((a, b) => b.quantity - a.quantity)[0];

      todaysSummary = {
        revenue: totalRevenue.toFixed(2),
        orders: orders.length,
        avgOrderValue: avgOrderValue.toFixed(2),
        topItem: topItemToday?.name || 'N/A',
      };

      // Get all items sold today with details
      todaysItems = Object.values(itemSales)
        .sort((a, b) => b.quantity - a.quantity)
        .map(item => ({
          name: item.name,
          quantity: item.quantity,
          revenue: item.revenue.toFixed(2),
          category: item.category,
          image: item.image,
        }));
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue: totalRevenue.toFixed(2),
          totalOrders: orders.length,
          dineInOrders: dineInOrders.length,
          takeawayOrders: takeawayOrders.length,
          dineInRevenue: dineInRevenue.toFixed(2),
          takeawayRevenue: takeawayRevenue.toFixed(2),
          avgOrderValue: avgOrderValue.toFixed(2),
          avgDineInValue: avgDineInValue.toFixed(2),
          avgTakeawayValue: avgTakeawayValue.toFixed(2),
        },
        todaysSummary,
        todaysItems,
        revenueTrend,
        topItems,
        orderTypeDistribution: {
          dineIn: {
            count: dineInOrders.length,
            revenue: dineInRevenue.toFixed(2),
            percentage: orders.length > 0 
              ? ((dineInOrders.length / orders.length) * 100).toFixed(1)
              : '0',
          },
          takeaway: {
            count: takeawayOrders.length,
            revenue: takeawayRevenue.toFixed(2),
            percentage: orders.length > 0
              ? ((takeawayOrders.length / orders.length) * 100).toFixed(1)
              : '0',
          },
        },
      },
    });
  } catch (error) {
    console.error('Sales report error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate sales report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
