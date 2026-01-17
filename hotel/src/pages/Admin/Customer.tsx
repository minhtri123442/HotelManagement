import React, { useEffect, useState } from "react";
import { MagnifyingGlassIcon, UserIcon } from "@heroicons/react/24/outline";

// --- CẤU HÌNH API ---
const API_URL = "http://localhost:5134/api/customers";

// --- INTERFACES ---
interface Customer {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
}

export default function CustomerList() {
  // --- 1. STATE ---
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");

  // --- 2. LOGIC API (Đã gộp vào trong Component) ---

  // Hàm lấy Header chứa Token từ LocalStorage
  const getAuthHeaders = () => {
    const userStr = localStorage.getItem("user");
    let token = "";
    if (userStr) {
      const user = JSON.parse(userStr);
      token = user.token;
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Gửi vé thông hành lên
    };
  };

  // Hàm gọi API lấy danh sách
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?keyword=${keyword}`, {
        method: "GET",
        headers: getAuthHeaders(), // Kèm Token vào request
      });

      // Xử lý nếu hết hạn token (401)
      if (res.status === 401) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("user"); // Xóa token cũ
        window.location.href = "/login";
        return;
      }

      if (!res.ok) throw new Error("Lỗi tải dữ liệu");

      const data = await res.json();
      setCustomers(data.items || []); // Backend trả về { items: [...] }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search (Tự động tìm khi gõ sau 0.5s)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  // --- 3. GIAO DIỆN (UI) ---
  return (
    <div className="p-6 bg-gray-50 min-h-screen w-full font-sans">
      {/* HEADER & THANH TÌM KIẾM */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserIcon className="w-8 h-8 text-blue-600" />
            Danh sách Khách hàng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Xem thông tin người dùng đã đăng ký vào hệ thống
          </p>
        </div>

        <div className="w-full md:w-auto">
          {/* Ô Tìm kiếm */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Tìm theo tên, email, sđt..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="p-4 border-b w-16">ID</th>
                <th className="p-4 border-b">Họ và tên</th>
                <th className="p-4 border-b">Email (Tài khoản)</th>
                <th className="p-4 border-b">Số điện thoại</th>
                <th className="p-4 border-b text-center">Vai trò</th>
                <th className="p-4 border-b text-right">Ngày tham gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center flex flex-col items-center justify-center text-gray-500"
                  >
                    <UserIcon className="w-12 h-12 text-gray-300 mb-2" />
                    Không tìm thấy khách hàng nào.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c.userId}
                    className="hover:bg-blue-50/30 transition duration-150 group"
                  >
                    <td className="p-4 text-gray-500 font-mono text-sm">
                      #{c.userId}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800 group-hover:text-blue-600 transition">
                        {c.fullName || "Chưa cập nhật"}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{c.email}</td>
                    <td className="p-4 text-gray-600 font-mono">
                      {c.phoneNumber ? (
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
                          {c.phoneNumber}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">
                          Trống
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-green-100 text-green-700 text-[11px] font-bold px-2 py-1 rounded-full border border-green-200 uppercase tracking-wide">
                        {c.role}
                      </span>
                    </td>
                    <td className="p-4 text-right text-sm text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-right text-xs text-gray-400">
        Tổng số khách hàng: {customers.length}
      </div>
    </div>
  );
}
