'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, TrendingUp } from 'lucide-react';
import Image from 'next/image';

interface TodayItem {
  name: string;
  quantity: number;
  revenue: string;
  category: string;
  image?: string;
}

interface Props {
  items: TodayItem[];
}

export default function TodayItemsSold({ items }: Props) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalRevenue = items.reduce((sum, item) => sum + parseFloat(item.revenue), 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <div>
          <p className="text-sm text-green-700 font-medium mb-1">Total Items Sold</p>
          <p className="text-2xl font-bold text-green-900">{totalQuantity}</p>
        </div>
        <div>
          <p className="text-sm text-green-700 font-medium mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-green-900">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {items.map((item, index) => (
          <Card key={index} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              {/* Item Image or Icon */}
              <div className="flex-shrink-0">
                {item.image ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-blue-600" />
                  </div>
                )}
              </div>

              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {item.name}
                  </h4>
                  <Badge variant="secondary" className="flex-shrink-0">
                    {item.category}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Qty:</span>
                      <span className="font-semibold text-blue-600 ml-1">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Revenue:</span>
                      <span className="font-semibold text-green-600 ml-1">
                        ${item.revenue}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm">
                    <p className="text-gray-500">Avg Price</p>
                    <p className="font-semibold text-gray-900">
                      ${(parseFloat(item.revenue) / item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Sales Performance</span>
                <span>{((item.quantity / totalQuantity) * 100).toFixed(1)}% of total</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                  style={{ width: `${(item.quantity / totalQuantity) * 100}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}