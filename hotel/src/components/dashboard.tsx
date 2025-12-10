import {
  FaUserFriends, FaBox, FaBed, FaConciergeBell, FaFileInvoice, FaHistory,
  FaUserClock, FaClock, FaMoneyBill, FaTools, FaTags, FaSignOutAlt,
  FaHome
} from "react-icons/fa";

import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="w-[155px] h-screen bg-gradient-to-b from-blue-200 to-blue-400 text-blue-900 p-1 flex flex-col shadow-xl">
      <h2 className="text-2xl font-bold mb-2 mt-3 tracking-wide text-blue-700">Admin</h2>

      <nav className="flex flex-col gap-1">

        <p className="text-xs uppercase font-semibold opacity-70 mb-1 text-blue-700">Quản lý</p>
        <MenuItem icon={<FaUserFriends />} label="Khách hàng" to="/customers" />
        <MenuItem icon={<FaBox />} label="Đơn hàng" />
        <MenuItem icon={<FaBed />} label="Phòng" />
        <MenuItem icon={<FaHome />} label="Khách sạn" to= "/hotelsList"/>
        <MenuItem icon={<FaUserFriends />} label="Nhân viên" to="/employees" />
        <MenuItem icon={<FaConciergeBell />} label="Dịch vụ" />
        <MenuItem icon={<FaFileInvoice />} label="Hóa đơn" />

        <p className="text-xs uppercase font-semibold opacity-70 mt-3 mb-1 text-blue-700">Theo dõi</p>
        <MenuItem icon={<FaHistory />} label="Lịch sử check-in" />
        <MenuItem icon={<FaUserClock />} label="Chấm công" />
        <MenuItem icon={<FaClock />} label="Ca làm" />
        <MenuItem icon={<FaMoneyBill />} label="Lương" />

        <p className="text-xs uppercase font-semibold opacity-70 mt-1 mb-1 text-blue-700">Khác</p>
        <MenuItem icon={<FaTools />} label="Bảo trì phòng" />
        <MenuItem icon={<FaTags />} label="Khuyến mãi" />

        <div className="mt-1 pt-3 border-t border-blue-300">
          <MenuItem icon={<FaSignOutAlt />} label="Đăng xuất" red />
        </div>

      </nav>
    </div>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  red?: boolean;
  to?: string;
}

function MenuItem({ icon, label, red = false, to = "#" }: MenuItemProps) {
  return (
    <Link
      to={to}
      className={`
        flex items-center gap-2 px-2.5 py-2 rounded-md transition-all text-sm
        text-white hover:text-white
        ${red 
          ? "hover:bg-red-300/40" 
          : "hover:bg-blue-500/70"
        }
      `}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
