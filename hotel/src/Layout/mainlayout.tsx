import { Outlet } from "react-router-dom";
import Header from "../components/Client/Header"; // Import Header vừa tạo

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900">
      {/* 1. Header chung cho toàn bộ trang khách hàng */}
      <Header />

      {/* 2. Nội dung thay đổi (HomePage, DetailPage...) */}
      {/* Thêm padding-top để không bị Header che mất nội dung */}
      <main className="flex-1 bg-gray-50 pt-16">
        <Outlet />
      </main>

      {/* 3. Footer */}
      <footer className="bg-gray-800 text-gray-300 py-10 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>© 2026 HotelBooking. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
