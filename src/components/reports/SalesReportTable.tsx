'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import {
  UtensilsCrossed,
  Package,
  Bike,
  Eye,
  ArrowUpDown
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'; // ✅ added DELIVERY
  tableId?: string | number | null;
  customerName?: string | null;
  customerPhone?: string | null;
  deliveryAddress?: string | null;
  total: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  itemCount: number;
}

interface SalesReportTableProps {
  orders: Order[];
  onViewOrder: (orderId: string) => void;
}

export default function SalesReportTable({
  orders,
  onViewOrder
}: SalesReportTableProps) {
  const [sortField, setSortField] = useState<'createdAt' | 'total'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const toggleSort = (field: 'createdAt' | 'total') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'total') {
      return multiplier * (parseFloat(a.total) - parseFloat(b.total));
    } else {
      return multiplier * (
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
  });

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No orders found for the selected period</p>
      </div>
    );
  }

  // ✅ Helper to render order type badge
  const OrderTypeBadge = ({ orderType }: { orderType: Order['orderType'] }) => {
    if (orderType === 'DINE_IN') {
      return (
        <Badge variant="default" className="bg-blue-600">
          <UtensilsCrossed className="h-3 w-3 mr-1" />
          Dine-In
        </Badge>
      )
    }
    if (orderType === 'TAKEAWAY') {
      return (
        <Badge variant="default" className="bg-orange-600">
          <Package className="h-3 w-3 mr-1" />
          Takeaway
        </Badge>
      )
    }
    // DELIVERY
    return (
      <Badge variant="default" className="bg-green-600">
        <Bike className="h-3 w-3 mr-1" />
        Delivery
      </Badge>
    )
  }

  // ✅ Helper to render table/customer info based on order type
  const OrderContext = ({ order }: { order: Order }) => {
    if (order.orderType === 'DINE_IN') {
      return <span>Table {order.tableId ?? '-'}</span>
    }
    if (order.orderType === 'DELIVERY') {
      return (
        <div className="text-xs">
          <p className="font-medium">{order.customerName || 'Guest'}</p>
          {order.deliveryAddress && (
            <p className="text-muted-foreground truncate max-w-[150px]">{order.deliveryAddress}</p>
          )}
        </div>
      )
    }
    return <span>{order.customerName || 'Guest'}</span>
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Table/Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSort('total')}
                className="hover:bg-transparent"
              >
                Total
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSort('createdAt')}
                className="hover:bg-transparent"
              >
                Time
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell>
                <OrderTypeBadge orderType={order.orderType} />
              </TableCell>
              <TableCell>
                <OrderContext order={order} />
              </TableCell>
              <TableCell>{order.itemCount} items</TableCell>
              <TableCell className="font-semibold">Rs {order.total}</TableCell>
              <TableCell>
                <Badge variant="outline">{order.paymentMethod}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={order.status === 'COMPLETED' ? 'default' : 'secondary'}
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewOrder(order.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}