import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

export default function Header() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  // Kiểm tra đăng nhập mỗi khi Header được render
  useEffect(() => {
    // Hàm này giúp lắng nghe sự thay đổi của localStorage
    const checkUser = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) setCurrentUser(JSON.parse(userStr));
      else setCurrentUser(null);
    };

    checkUser();

    // Lắng nghe sự kiện storage (để khi Login xong nó tự cập nhật Header)
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/"); // Về trang chủ sau khi logout
    window.dispatchEvent(new Event("storage")); // Bắn sự kiện để cập nhật lại UI
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[60] bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm h-16 flex items-center transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition text-white">
            <BuildingOffice2Icon className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold text-blue-600 tracking-tighter italic">
            HotelBooking
          </span>
        </Link>

        {/* RIGHT MENU */}
        <div className="hidden md:flex items-center gap-6">
          {currentUser ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-bold">
                Hi, {currentUser.fullName}
              </span>
              <Link
                to="/booking-history"
                className="flex items-center gap-1 text-blue-600 font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
              >
                <ClipboardDocumentListIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Lịch sử</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Thoát
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link
                to="/login"
                className="text-gray-700 font-bold hover:text-blue-600 transition"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white font-bold px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
