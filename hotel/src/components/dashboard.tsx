import {
  FaUserFriends,
  FaCalendarCheck,
  FaBed,
  FaConciergeBell,
  FaFileInvoiceDollar,
  FaChartLine,
  FaHotel,
  FaSignOutAlt,
  FaCalendarAlt,
  FaComments,
  FaPercentage,
  FaMapMarkedAlt,
} from "react-icons/fa";

import { Link, useLocation } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="w-64 h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col shadow-2xl transition-all duration-300 font-sans">
      {/* Header Dashboard */}
      <div className="p-5 border-b border-blue-700 flex flex-col items-center justify-center bg-blue-950/30">
        <h2 className="text-xl font-bold tracking-wider uppercase text-white">
          Agoda Admin
        </h2>
        <span className="text-xs text-blue-300 mt-1">Partner Central</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 custom-scrollbar">
        {/* NHÓM 1: VẬN HÀNH */}
        <MenuGroup label="Vận hành" />

        {/* Lưu ý: App.js của bạn chưa có route riêng cho Dashboard, 
           tạm thời mình trỏ về /admin (nó sẽ redirect sang hotelsList theo code App.js) 
           hoặc bạn cần tạo thêm route dashboard riêng */}
        <MenuItem
          icon={<FaChartLine />}
          label="Tổng quan (Dashboard)"
          to="/admin"
        />

        {/* Lưu ý: Route bookings chưa có trong App.js -> Vẫn sẽ lỗi 404 cho đến khi bạn khai báo trong App.js */}
        <MenuItem
          icon={<FaCalendarCheck />}
          label="Đặt phòng (Bookings)"
          to="/admin/bookings"
        />

        <MenuItem
          icon={<FaCalendarAlt />}
          label="Lịch & Giá (Calendar)"
          to="/admin/availability" // Đã khớp với App.js
        />

        {/* Chưa có trong App.js */}
        <MenuItem
          icon={<FaFileInvoiceDollar />}
          label="Tài chính (Finance)"
          to="/admin/finance"
        />

        {/* NHÓM 2: QUẢN LÝ TÀI SẢN */}
        <MenuGroup label="Chỗ nghỉ" />

        <MenuItem
          icon={<FaHotel />}
          label="Thông tin Khách sạn"
          to="/admin/hotelsList" // Đã khớp với App.js
        />

        <MenuItem
          icon={<FaBed />}
          label="Loại phòng (Rooms)"
          to="/admin/roomTypes/hotel/0" // Đã khớp với App.js
        />

        {/* Chưa có trong App.js */}
        <MenuItem
          icon={<FaMapMarkedAlt />}
          label="Địa điểm (Locations)"
          to="/admin/locations"
        />

        {/* Chưa có trong App.js */}
        <MenuItem
          icon={<FaConciergeBell />}
          label="Tiện ích (Amenities)"
          to="/admin/amenities"
        />

        {/* NHÓM 3: KHÁCH HÀNG & MARKETING */}
        <MenuGroup label="Khách hàng" />

        {/* Trong App.js bạn đặt là 'customers' chứ không phải 'users' */}
        <MenuItem
          icon={<FaUserFriends />}
          label="Khách hàng (Customers)"
          to="/admin/customers" // Sửa lại cho khớp với App.js
        />

        {/* Chưa có trong App.js */}
        <MenuItem
          icon={<FaComments />}
          label="Đánh giá (Reviews)"
          to="/admin/reviews"
        />

        {/* Chưa có trong App.js */}
        <MenuItem
          icon={<FaPercentage />}
          label="Khuyến mãi (Promos)"
          to="/admin/promotions"
        />

        {/* LOGOUT */}
        <div className="mt-auto pt-4 pb-2 border-t border-blue-700/50">
          <MenuItem
            icon={<FaSignOutAlt />}
            label="Đăng xuất"
            red
            to="/HomePage" // Đăng xuất thì về trang chủ Public
          />
        </div>
      </nav>
    </div>
  );
}

// ... (Giữ nguyên phần MenuGroup và MenuItem ở dưới không đổi) ...
function MenuGroup({ label }: { label: string }) {
  return (
    <p className="text-[11px] uppercase font-bold text-blue-300/80 mt-5 mb-2 px-3 tracking-wide">
      {label}
    </p>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  red?: boolean;
  to?: string;
}

function MenuItem({ icon, label, red = false, to = "#" }: MenuItemProps) {
  const location = useLocation();

  // Logic active cần sửa nhẹ để khớp với nested route
  const isActive =
    to !== "#" &&
    (location.pathname === to || location.pathname.startsWith(to + "/"));

  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200
        text-[13.5px] font-medium group
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
