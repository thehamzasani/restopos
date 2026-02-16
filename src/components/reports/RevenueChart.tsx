'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface RevenueData {
  date: string;
  total: number;
  dineIn: number;
  takeaway: number;
}

interface Props {
  data: RevenueData[];
}

export default function RevenueChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        No revenue data available
      </div>
    );
  }

  // Format data for better display
  const formattedData = data.map(item => ({
    ...item,
    date: format(parseISO(item.date), 'MMM dd'),
    displayTotal: `$${item.total.toFixed(2)}`,
    displayDineIn: `$${item.dineIn.toFixed(2)}`,
    displayTakeaway: `$${item.takeaway.toFixed(2)}`
  }));

  // Calculate average for reference line
  const avgRevenue = data.reduce((sum, item) => sum + item.total, 0) / data.length;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-semibold mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span className="text-sm">Total: ${payload[0].value.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span className="text-sm">Dine-In: ${payload[1].value.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              <span className="text-sm">Takeaway: ${payload[2].value.toFixed(2)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Average Revenue</p>
          <p className="text-xl font-bold text-blue-600">${avgRevenue.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Highest Day</p>
          <p className="text-xl font-bold text-green-600">
            ${Math.max(...data.map(d => d.total)).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Lowest Day</p>
          <p className="text-xl font-bold text-orange-600">
            ${Math.min(...data.map(d => d.total)).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Area Chart (Shows trends better with filled areas) */}
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDineIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorTakeaway" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value}`}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
            iconType="circle"
          />
          
          {/* Average reference line */}
          <ReferenceLine 
            y={avgRevenue} 
            stroke="#94a3b8" 
            strokeDasharray="5 5"
            label={{ 
              value: `Avg: $${avgRevenue.toFixed(2)}`, 
              position: 'right',
              fill: '#64748b',
              fontSize: 12
            }}
          />
          
          {/* Areas with gradients */}
          <Area
            type="monotone"
            dataKey="total"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="url(#colorTotal)"
            name="Total Revenue"
          />
          
          <Area
            type="monotone"
            dataKey="dineIn"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#colorDineIn)"
            name="Dine-In"
          />
          
          <Area
            type="monotone"
            dataKey="takeaway"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#colorTakeaway)"
            name="Takeaway"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Trend Analysis */}
      <TrendAnalysis data={data} />
    </div>
  );
}

// Trend Analysis Component
function TrendAnalysis({ data }: { data: RevenueData[] }) {
  if (data.length < 2) return null;

  const firstDay = data[0].total;
  const lastDay = data[data.length - 1].total;
  const change = lastDay - firstDay;
  const percentChange = ((change / firstDay) * 100).toFixed(1);
  const isPositive = change >= 0;

  return (
    <div className={`p-4 rounded-lg border-2 ${
      isPositive 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Period Trend</p>
          <p className={`text-2xl font-bold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? '+' : ''}{percentChange}%
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {isPositive ? '📈 Increasing' : '📉 Decreasing'}
          </p>
          <p className={`text-lg font-semibold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? '+' : ''}{change.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-300">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Start: </span>
            <span className="font-semibold">${firstDay.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">End: </span>
            <span className="font-semibold">${lastDay.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}