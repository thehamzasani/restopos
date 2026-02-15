'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface TopItem {
  name: string;
  quantity: number;
  revenue: string;
}

interface Props {
  items: TopItem[];
}

export default function TopSellingItems({ items }: Props) {
  const data = items.slice(0, 5).map(item => ({
    name: item.name.length > 15 
      ? item.name.substring(0, 15) + '...' 
      : item.name,
    revenue: parseFloat(item.revenue),
    quantity: item.quantity,
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'revenue') return `$${value.toFixed(2)}`;
              return value;
            }}
          />
          <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
        </BarChart>
      </ResponsiveContainer>

      {/* Item List */}
      <div className="space-y-2">
        {items.slice(0, 10).map((item, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                {index + 1}
              </div>
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} sold
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-600">
                ${item.revenue}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}