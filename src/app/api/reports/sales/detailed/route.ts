import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { 
  startOfDay, 
  endOfDay, 
  subDays, 
  startOfYesterday, 
  endOfYesterday,
  parseISO,
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
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const orderType = searchParams.get('orderType');
    const paymentMethod = searchParams.get('paymentMethod');
    const status = searchParams.get('status');

    // Use the SAME date calculation logic as main sales API
    let start: Date;
    let end: Date;

    if (startDateParam && endDateParam) {
      start = startOfDay(parseISO(startDateParam));
      end = endOfDay(parseISO(endDateParam));
    } else {
      // Default to today
      start = startOfDay(new Date());
      end = endOfDay(new Date());
    }

    console.log(`[Detailed Sales] Fetching orders from ${start.toISOString()} to ${end.toISOString()}`);

    // Build filter - MUST match main sales API logic
    const where: any = {
      createdAt: {
        gte: start,
        lte: end,
      },
      status: status && status !== 'ALL' ? status : 'COMPLETED', // Default to COMPLETED like main API
    };

    if (orderType && orderType !== 'ALL') {
      where.orderType = orderType;
    }

    if (paymentMethod && paymentMethod !== 'ALL') {
      where.paymentMethod = paymentMethod;
    }

    // Fetch orders with items
    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`[Detailed Sales] Found ${orders.length} orders`);

    // Format response
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      tableId: order.table?.number,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      total: order.total.toString(),
      subtotal: order.subtotal.toString(),
      tax: order.tax.toString(),
      discount: order.discount.toString(),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      itemCount: order.orderItems.length,
      items: order.orderItems.map(item => ({
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.price.toString(),
        subtotal: item.subtotal.toString(),
      })),
    }));

    // Calculate totals (same logic as main API)
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const totalOrders = orders.length;

    console.log(`[Detailed Sales] Total Revenue: $${totalRevenue.toFixed(2)}, Orders: ${totalOrders}`);

    return NextResponse.json({
      success: true,
      data: {
        orders: formattedOrders,
        total: orders.length,
        totalRevenue: totalRevenue.toFixed(2),
        summary: {
          totalRevenue: totalRevenue.toFixed(2),
          totalOrders: totalOrders,
        }
      },
    });
  } catch (error) {
    console.error('[Detailed Sales] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch detailed sales report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}