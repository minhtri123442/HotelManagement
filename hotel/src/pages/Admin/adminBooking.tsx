import React, { useEffect, useState } from "react";
import {
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  BanknotesIcon,
  ChatBubbleBottomCenterTextIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

// 1. Import SweetAlert2
import Swal from "sweetalert2";

const API_BASE = "http://localhost:5134";

// 2. Cấu hình Toast (Thông báo nhỏ ở góc)
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export default function AdminBookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBookings, setFilteredBookings] = useState([]);

  // --- STATE CHO MODAL CHI TIẾT ---
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredBookings(bookings);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      const results = bookings.filter(
        (b) =>
          b.bookingCode?.toLowerCase().includes(lowerTerm) ||
          b.customerName?.toLowerCase().includes(lowerTerm)
      );
      setFilteredBookings(results);
    }
  }, [searchTerm, bookings]);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings`);
      if (!res.ok) throw new Error("Server lỗi");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const sortedList = list.sort(
        (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
      );
      setBookings(sortedList);
      setFilteredBookings(sortedList);
    } catch (err) {
      console.error(err);
      // Thông báo lỗi tải trang nhẹ nhàng
      Toast.fire({
        icon: "error",
        title: "Không thể tải danh sách đơn hàng",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- 3. HÀM CẬP NHẬT TRẠNG THÁI (ĐÃ SỬA VỚI SWEETALERT2) ---
  const handleUpdateStatus = (id, status) => {
    const mapStatus = {
      Confirmed: "Xác nhận",
      Cancelled: "Hủy bỏ",
      Pending: "Chờ xử lý",
    };

    const statusText = mapStatus[status] || status;

    // Màu sắc icon dựa theo trạng thái
    let iconType = "question";
    let confirmColor = "#3085d6";
    if (status === "Cancelled") {
      iconType = "warning";
      confirmColor = "#d33";
    } else if (status === "Confirmed") {
      iconType = "info";
      confirmColor = "#10b981"; // Green
    }

    // Hiện Popup xác nhận
    Swal.fire({
      title: `Chuyển trạng thái: ${statusText}?`,
      text: "Bạn có chắc chắn muốn thực hiện thay đổi này không?",
      icon: iconType,
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Đồng ý, cập nhật!",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Nếu người dùng bấm Đồng ý -> Gọi API
        try {
          // Hiển thị loading trong lúc chờ API
          Swal.fire({
            title: "Đang xử lý...",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const res = await fetch(`${API_BASE}/api/bookings/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(status),
          });

          if (res.ok) {
            // Tắt loading cũ -> Hiện Toast Success
            Toast.fire({
              icon: "success",
              title: `Đã cập nhật thành công: ${statusText}`,
            });

            fetchBookings();

            // Cập nhật state modal nếu đang mở
            if (selectedBooking && selectedBooking.bookingId === id) {
              setSelectedBooking((prev) => ({ ...prev, status: status }));
            }
          } else {
            // API trả về lỗi
            const errText = await res.text();
            Swal.fire("Lỗi!", errText || "Cập nhật thất bại", "error");
          }
        } catch (err) {
          Swal.fire("Lỗi!", "Không thể kết nối đến server", "error");
        }
      }
    });
  };

  // Hàm mở modal
  const openDetailModal = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  // Hàm đóng modal
  const closeDetailModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700 border border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans relative">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Quản lý Đặt phòng
            <span className="text-sm font-normal bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              {filteredBookings.length} đơn
            </span>
          </h1>

          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition"
              placeholder="Tìm mã đơn hoặc tên khách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Mã / Ngày đặt</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Khách sạn</th>
                <th className="px-6 py-4">Tổng tiền</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => (
                  <tr
                    key={b.bookingId}
                    className="hover:bg-blue-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-blue-600">
                        {b.bookingCode}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {formatDate(b.bookingDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-700">
                          {b.customerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600 max-w-[200px]">
                        <BuildingOfficeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate" title={b.hotelName}>
                          {b.hotelName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {formatMoney(b.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* Dropdown chọn trạng thái nhanh */}
                      <select
                        className={`text-xs font-bold px-2 py-1 rounded-full outline-none cursor-pointer border appearance-none text-center ${getStatusStyle(
                          b.status
                        )}`}
                        value={b.status}
                        onChange={(e) =>
                          handleUpdateStatus(b.bookingId, e.target.value)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openDetailModal(b)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition shadow-sm"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400">
                    <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    Không tìm thấy dữ liệu phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL CHI TIẾT (POPUP BOX) --- */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop mờ */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={closeDetailModal}
          ></div>

          {/* Nội dung Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  Chi tiết đơn hàng{" "}
                  <span className="text-blue-600">
                    #{selectedBooking.bookingCode}
                  </span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Ngày đặt: {formatDate(selectedBooking.bookingDate)}
                </p>
              </div>
              <button
                onClick={closeDetailModal}
                className="p-2 hover:bg-gray-200 rounded-full transition"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* 1. Thông tin khách sạn & Phòng */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <BuildingOfficeIcon className="w-5 h-5" /> Thông tin Khách sạn
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Khách sạn</p>
                    <p className="font-bold text-gray-800 text-lg">
                      {selectedBooking.hotelName}
                    </p>
                    <p className="text-gray-500 flex items-center gap-1 mt-1">
                      <MapPinIcon className="w-3 h-3" />{" "}
                      {selectedBooking.hotelAddress || "Chưa cập nhật địa chỉ"}
                    </p>
                  </div>
                  <div className="flex flex-col justify-center bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500">Check-in:</span>
                      <span className="font-bold">
                        {selectedBooking.checkInDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Check-out:</span>
                      <span className="font-bold">
                        {selectedBooking.checkOutDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Danh sách phòng */}
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                    Chi tiết phòng
                  </p>
                  <div className="space-y-2">
                    {selectedBooking.roomNames &&
                      selectedBooking.roomNames.map((room, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center bg-white p-2 rounded border border-gray-100"
                        >
                          <span className="font-medium text-gray-700">
                            {room}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            x1
                          </span>
                        </div>
                      ))}
                    {(!selectedBooking.roomNames ||
                      selectedBooking.roomNames.length === 0) && (
                      <p className="text-gray-500 italic text-sm">
                        Không có thông tin chi tiết phòng.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Thông tin khách hàng & Ghi chú (Quan trọng) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cột trái: Thông tin tài khoản đặt */}
                <div className="md:col-span-1">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-gray-500" /> Người đặt
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                    <p className="font-bold text-gray-800">
                      {selectedBooking.customerName}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Tài khoản hệ thống
                    </p>
                  </div>
                </div>

                {/* Cột phải: Ghi chú / Yêu cầu đặc biệt */}
                <div className="md:col-span-2">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-gray-500" />
                    Ghi chú & Liên hệ thực tế
                  </h3>
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed shadow-sm">
                    {selectedBooking.specialRequest
                      ? selectedBooking.specialRequest
                      : "Không có ghi chú nào."}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Tổng thanh toán:</span>
                <span className="text-2xl font-bold text-red-600">
                  {formatMoney(selectedBooking.totalAmount)}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded border ${
                    selectedBooking.paymentStatus === "Paid"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
                >
                  {selectedBooking.paymentStatus === "Paid"
                    ? "Đã thanh toán"
                    : "Chưa thanh toán"}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Đóng
                </button>
                {selectedBooking.status === "Pending" && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(
                        selectedBooking.bookingId,
                        "Confirmed"
                      );
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                  >
                    Xác nhận đơn
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
