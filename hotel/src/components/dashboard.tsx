import {
  FaUserFriends,
  FaCalendarCheck, // Icon booking
  FaBed,
  FaConciergeBell,
  FaFileInvoiceDollar, // Icon hóa đơn tiền
  FaChartLine, // Thống kê, Doanh thu
  FaHotel, // Icon Khách sạn
  FaSignOutAlt,
  FaCalendarAlt, // Lịch & Giá (Availability)
  FaComments, // Đánh giá
  FaPercentage, // Khuyến mãi
  FaMapMarkedAlt, // Địa điểm
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
        {/* NHÓM 1: VẬN HÀNH HÀNG NGÀY (Daily Operations) */}
        <MenuGroup label="Vận hành" />
        <MenuItem
          icon={<FaChartLine />}
          label="Tổng quan (Dashboard)"
          to="/dashboard"
        />
        <MenuItem
          icon={<FaCalendarCheck />}
          label="Đặt phòng (Bookings)"
          to="/bookings"
        />
        <MenuItem
          icon={<FaCalendarAlt />}
          label="Lịch & Giá (Calendar)"
          to="/availability" // Quản lý bảng RoomAvailability
        />
        <MenuItem
          icon={<FaFileInvoiceDollar />}
          label="Tài chính (Finance)"
          to="/finance"
        />

        {/* NHÓM 2: QUẢN LÝ TÀI SẢN (Property Management) */}
        <MenuGroup label="Chỗ nghỉ" />
        <MenuItem
          icon={<FaHotel />}
          label="Thông tin Khách sạn"
          to="/hotelsList" // CRUD Hotels
        />
        <MenuItem
          icon={<FaBed />}
          label="Loại phòng (Rooms)"
          to="/roomTypes/hotel/0" // CRUD RoomTypes
        />
        <MenuItem
          icon={<FaMapMarkedAlt />}
          label="Địa điểm (Locations)"
          to="/locations" // CRUD Locations
        />
        <MenuItem
          icon={<FaConciergeBell />}
          label="Tiện ích (Amenities)"
          to="/amenities" // CRUD Amenities
        />

        {/* NHÓM 3: KHÁCH HÀNG & MARKETING */}
        <MenuGroup label="Khách hàng" />
        <MenuItem
          icon={<FaUserFriends />}
          label="Người dùng (Users)"
          to="/users"
        />
        <MenuItem
          icon={<FaComments />}
          label="Đánh giá (Reviews)"
          to="/reviews"
        />
        <MenuItem
          icon={<FaPercentage />}
          label="Khuyến mãi (Promos)"
          to="/promotions"
        />

        {/* Nút đăng xuất */}
        <div className="mt-auto pt-4 pb-2 border-t border-blue-700/50">
          <MenuItem
            icon={<FaSignOutAlt />}
            label="Đăng xuất"
            red
            to="/logout"
          />
        </div>
      </nav>
    </div>
  );
}

// Component tiêu đề nhóm
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

  // Logic active: Nếu to="/bookings" thì các path con như "/bookings/detail/1" cũng active
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
