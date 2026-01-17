import React from "react";
import {
  FaUserFriends,
  FaCalendarCheck,
  FaBed,
  FaConciergeBell,
  FaChartLine,
  FaHotel,
  FaSignOutAlt,
  FaCalendarAlt,
  FaComments,
} from "react-icons/fa";
import { Link, useLocation, Outlet } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* === LEFT SIDEBAR (Cố định) === */}
      <aside className="w-64 h-full bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col shadow-2xl z-20 font-sans shrink-0">
        {/* Header Dashboard */}
        <div className="p-5 border-b border-blue-700 flex flex-col items-center justify-center bg-blue-950/30">
          <h2 className="text-xl font-bold tracking-wider uppercase text-white">
            Agoda Admin
          </h2>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 custom-scrollbar">
          {/* NHÓM 1: VẬN HÀNH */}
          <MenuGroup label="Vận hành" />
          <MenuItem icon={<FaChartLine />} label="Tổng quan" to="/admin" />
          <MenuItem
            icon={<FaCalendarCheck />}
            label="Đặt phòng"
            to="/admin/bookings"
          />
          <MenuItem
            icon={<FaCalendarAlt />}
            label="Lịch & Giá"
            to="/admin/availabilityCalendar"
          />

          {/* NHÓM 2: QUẢN LÝ TÀI SẢN */}
          <MenuGroup label="Chỗ nghỉ" />
          <MenuItem
            icon={<FaHotel />}
            label="Khách sạn"
            to="/admin/hotels" // Đã sửa cho ngắn gọn
          />
          <MenuItem
            icon={<FaBed />}
            label="Loại phòng"
            to="/admin/room-types" // Đã sửa theo chuẩn
          />
          <MenuItem
            icon={<FaConciergeBell />}
            label="Tiện ích"
            to="/admin/amenities" // Module mới làm
          />

          {/* NHÓM 3: KHÁCH HÀNG & MARKETING */}
          <MenuGroup label="Khách hàng" />
          <MenuItem
            icon={<FaUserFriends />}
            label="Khách hàng"
            to="/admin/customers"
          />
          <MenuItem
            icon={<FaComments />}
            label="Biểu đồ"
            to="/admin/dashboard"
          />

          {/* LOGOUT AREA */}
          <div className="pt-4 pb-2 border-t border-blue-700/50">
            <MenuItem
              icon={<FaSignOutAlt />}
              label="Đăng xuất"
              red
              to="/login"
              onClick={() => {
                localStorage.removeItem("user");
                window.dispatchEvent(new Event("storage"));
              }}
            />
          </div>
        </nav>
      </aside>

      {/* === RIGHT CONTENT (Nơi hiển thị các Page con) === */}
      <main className="flex-1 h-full overflow-y-auto bg-gray-50 relative scroll-smooth">
        {/* Header nhỏ phía trên (Optional) */}
        <header className="bg-white shadow-sm h-14 flex items-center justify-between px-6 sticky top-0 z-10">
          <span className="text-gray-500 text-sm font-medium">
            Admin Portal / Quản lý hệ thống
          </span>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs text-green-600 font-semibold">Online</span>
          </div>
        </header>

        {/* CONTENT AREA - Đây là nơi HotelManagement, AmenitiesPage... sẽ hiện ra */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// --- Helper Components ---

function MenuGroup({ label }: { label: string }) {
  return (
    <p className="text-[11px] uppercase font-bold text-blue-300/80 mt-5 mb-2 px-3 tracking-wide select-none">
      {label}
    </p>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  red?: boolean;
  to?: string;
  onClick?: (e: React.MouseEvent) => void;
}

function MenuItem({
  icon,
  label,
  red = false,
  to = "#",
  onClick,
}: MenuItemProps) {
  const location = useLocation();

  // Logic active thông minh: Active nếu trùng URL hoặc là trang con
  const isActive =
    to === "/admin"
      ? location.pathname === "/admin" // Nếu là trang tổng quan thì phải khớp 100%
      : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200
        text-[13.5px] font-medium group select-none
        ${
          red
            ? "text-red-200 hover:bg-red-500/20 hover:text-red-100 mt-1"
            : isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50 translate-x-1"
            : "text-blue-100 hover:bg-blue-700/50 hover:text-white hover:translate-x-1"
        }
      `}
    >
      <span
        className={`text-base ${
          isActive ? "text-white" : "text-blue-300 group-hover:text-white"
        }`}
      >
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}
