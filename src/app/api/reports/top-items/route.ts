import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay, subDays } from 'date-fns';

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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '10');

    const start = startDate 
      ? startOfDay(new Date(startDate))
      : startOfDay(subDays(new Date(), 30));
    
    const end = endDate 
      ? endOfDay(new Date(endDate))
      : endOfDay(new Date());

    // Get order items within date range
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: start,
            lte: end,
          },
          status: {
            in: ['COMPLETED', 'READY'],
          },
          paymentStatus: 'PAID',
        },
      },
      include: {
        menuItem: {
          include: {
            category: true,
          },
        },
      },
    });

    // Aggregate by menu item
    const itemStats: Record<string, {
      id: string;
      name: string;
      category: string;
      quantitySold: number;
      revenue: number;
      image: string | null;
    }> = {};

    orderItems.forEach(item => {
      const key = item.menuItemId;
      
      if (!itemStats[key]) {
        itemStats[key] = {
          id: item.menuItemId,
          name: item.menuItem.name,
          category: item.menuItem.category.name,
          quantitySold: 0,
          revenue: 0,
          image: item.menuItem.image,
        };
      }

      itemStats[key].quantitySold += item.quantity;
      itemStats[key].revenue += Number(item.subtotal);
    });

    // Sort by revenue and limit
    const topItems = Object.values(itemStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
      .map(item => ({
        ...item,
        revenue: item.revenue.toFixed(2),
      }));

    return NextResponse.json({
      success: true,
      data: topItems,
    });
  } catch (error) {
    console.error('Top items report error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch top items',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}