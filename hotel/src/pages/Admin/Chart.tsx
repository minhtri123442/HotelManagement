import React, { useEffect, useState } from "react";
import axios from "axios";
import PremiumRevenueChart from "../../components/Admin/RevenueChart";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Gọi API revenue-stats từ DashboardController.cs
    axios
      .get("http://localhost:5134/api/Dashboard/revenue-stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!stats) return <div>Đang tải thống kê...</div>;

  //   const sortedData = stats.monthlyRevenue.sort(
  //     (a: any, b: any) => a.month - b.month
  //   );
  // Chart.tsx
  // Tạm thời fake thêm data để check biểu đồ
  const sortedData = [
    { month: 1, revenue: 15000000 }, // Tháng 1
    { month: 2, revenue: 25000000 }, // Tháng 2
    { month: 3, revenue: 18000000 }, // Tháng 3
    { month: 4, revenue: 35000000 }, // Tháng 4
  ];

  // Sau đó mới truyền vào component
  <PremiumRevenueChart data={sortedData} />;
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Các Card con số tổng quát */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card đơn giản */}
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <p className="text-xs text-gray-500 font-medium uppercase">
            Tổng Doanh Thu
          </p>
          <p className="text-xl font-bold text-gray-800">
            {new Intl.NumberFormat("vi-VN").format(stats.totalRevenue)} đ
          </p>
        </div>

        <div className="bg-white p-4 rounded-md border border-gray-200">
          <p className="text-xs text-gray-500 font-medium uppercase">
            Tổng Đơn Đặt
          </p>
          <p className="text-xl font-bold text-gray-800">
            {stats.totalBookings} đơn
          </p>
        </div>

        <div className="bg-white p-4 rounded-md border border-gray-200">
          <p className="text-xs text-gray-500 font-medium uppercase">
            Chờ Xác Nhận
          </p>
          <p className="text-xl font-bold text-gray-800">
            {stats.pendingBookings} đơn
          </p>
        </div>
      </div>

      {/* Biểu đồ Recharts */}
      <PremiumRevenueChart data={sortedData} />
    </div>
  );
}
