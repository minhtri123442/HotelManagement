import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function SimpleRevenueChart({ data }: { data: any[] }) {
  const chartData = data.map(item => ({
    name: `Tháng ${item.month}`,
    revenue: item.revenue
  }));

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-bold text-gray-600 mb-4">Doanh thu theo tháng</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#666' }} 
              axisLine={{ stroke: '#ddd' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#666' }}
              axisLine={{ stroke: '#ddd' }}
              tickFormatter={(value) => `${value / 1000000}M`}
            />
            <Tooltip 
              contentStyle={{ fontSize: '12px', borderRadius: '4px' }}
            />
            <Line 
              type="linear" // Sửa thành linear để đường kẻ thẳng, không uốn lượn
              dataKey="revenue" 
              stroke="#2563eb" // Màu xanh Blue cơ bản
              strokeWidth={2}
              dot={{ r: 4, fill: '#2563eb' }} // Hiện dấu chấm rõ ràng
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}