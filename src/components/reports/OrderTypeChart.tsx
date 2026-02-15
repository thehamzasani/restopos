'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { UtensilsCrossed, Package } from 'lucide-react';

interface OrderTypeData {
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
}

interface Props {
  data: OrderTypeData;
}

const COLORS = {
  dineIn: '#3b82f6',
  takeaway: '#f97316',
};

export default function OrderTypeChart({ data }: Props) {
  const chartData = [
    { 
      name: 'Dine-In', 
      value: data.dineIn.count,
      revenue: data.dineIn.revenue,
      percentage: data.dineIn.percentage,
    },
    { 
      name: 'Takeaway', 
      value: data.takeaway.count,
      revenue: data.takeaway.revenue,
      percentage: data.takeaway.percentage,
    },
  ];

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === 0 ? COLORS.dineIn : COLORS.takeaway} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number, name: string, props: any) => {
              return [
                `${value} orders ($${props.payload.revenue})`,
                name
              ];
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <UtensilsCrossed className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Dine-In</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {data.dineIn.count}
          </p>
          <p className="text-sm text-blue-700">
            ${data.dineIn.revenue} • {data.dineIn.percentage}%
          </p>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-orange-600" />
            <span className="font-semibold text-orange-900">Takeaway</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {data.takeaway.count}
          </p>
          <p className="text-sm text-orange-700">
            ${data.takeaway.revenue} • {data.takeaway.percentage}%
          </p>
        </div>
      </div>
    </div>
  );
}