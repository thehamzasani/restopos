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
} from 'recharts';
import { format } from 'date-fns';

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
  const formattedData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd'),
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          formatter={(value: number) => `$${value.toFixed(2)}`}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#8884d8"
          strokeWidth={2}
          name="Total Revenue"
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="dineIn"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Dine-In"
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="takeaway"
          stroke="#f97316"
          strokeWidth={2}
          name="Takeaway"
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}