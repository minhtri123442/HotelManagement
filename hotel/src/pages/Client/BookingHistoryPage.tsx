import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  CalendarDaysIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const API_BASE = "http://localhost:5134";

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Lấy User từ LocalStorage
    const userStored = localStorage.getItem("user");
    if (!userStored) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userStored);
    const userId = user.userID || user.userId || user.id;

    // 2. Gọi API lấy lịch sử
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/bookings/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        }
      } catch (error) {
        console.error("Lỗi tải lịch sử:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  // Hàm render trạng thái (Màu sắc)
  const renderStatusBadge = (status) => {
    let colorClass = "bg-gray-100 text-gray-600";
    let label = status;

    switch (status) {
      case "Pending":
        colorClass = "bg-yellow-100 text-yellow-700";
        label = "Chờ xác nhận";
        break;
      case "Confirmed":
        colorClass = "bg-green-100 text-green-700";
        label = "Đã xác nhận";
        break;
      case "Cancelled":
        colorClass = "bg-red-100 text-red-700";
        label = "Đã hủy";
        break;
      default:
        break;
    }
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colorClass}`}
      >
        {label}
      </span>
    );
  };

  const handleCancelBooking = async (bookingId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Đơn hàng sẽ bị hủy và không thể khôi phục!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Đồng ý hủy",
      cancelButtonText: "Quay lại",
    });

    if (result.isConfirmed) {
      try {
        // Gọi API cập nhật trạng thái sang 'Cancelled'
        // Giả sử API của bro là: PUT /api/bookings/{id}/status
        const res = await fetch(
          `${API_BASE}/api/bookings/${bookingId}/cancel`,
          {
            method: "PUT", // Hoặc PATCH tùy backend bro viết
            headers: { "Content-Type": "application/json" },
          }
        );

        if (res.ok) {
          Swal.fire(
            "Đã hủy!",
            "Đơn hàng của bạn đã được hủy thành công.",
            "success"
          );
          // Cập nhật lại UI tại chỗ mà không cần load lại trang
          setBookings((prev) =>
            prev.map((b) =>
              b.bookingId === bookingId ? { ...b, status: "Cancelled" } : b
            )
          );
        } else {
          Swal.fire("Lỗi!", "Không thể hủy đơn hàng lúc này.", "error");
        }
      } catch (error) {
        console.error("Lỗi khi hủy đơn:", error);
        Swal.fire("Lỗi!", "Có lỗi kết nối đến server.", "error");
      }
    }
  };

  const processImg = (img) => {
    if (!img) return "https://via.placeholder.com/150";
    if (img.startsWith("http")) return img;
    return `${API_BASE}/${img}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Lịch sử đặt phòng của tôi
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Bạn chưa có đơn đặt phòng nào.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 text-blue-600 font-bold hover:underline"
            >
              Đặt phòng ngay
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((item) => (
              <div
                key={item.bookingId}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Cột trái: Ảnh khách sạn (Nếu có) */}
                  <div className="w-full md:w-48 h-32 md:h-auto bg-gray-200 relative">
                    <img
                      src={processImg(item.hotelImage)}
                      alt="hotel"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Cột phải: Thông tin */}
                  <div className="p-6 flex-grow flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">
                          #{item.bookingCode}
                        </span>
                        {renderStatusBadge(item.status)}
                      </div>

                      <h3 className="text-lg font-bold text-blue-900">
                        {item.hotelName}
                      </h3>

                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" /> {item.hotelAddress}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-700 mt-3">
                        <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-blue-700 font-medium">
                          <CalendarDaysIcon className="w-4 h-4" />
                          {item.checkInDate}{" "}
                          <span className="text-gray-400">→</span>{" "}
                          {item.checkOutDate}
                        </div>
                        <div className="text-gray-500">
                          ({item.roomNames?.join(", ")} - {item.totalRooms}{" "}
                          phòng)
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end min-w-[150px]">
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" /> Ngày đặt:{" "}
                        {new Date(item.bookingDate).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="text-right mt-4 md:mt-0">
                        <p className="text-xs text-gray-500">Tổng thanh toán</p>
                        <p className="text-xl font-extrabold text-red-600">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.totalAmount)}
                        </p>

                        {item.status === "Pending" && (
                          <button
                            onClick={() => handleCancelBooking(item.bookingId)}
                            className="mt-3 px-4 py-1.5 border border-red-500 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors active:scale-95"
                          >
                            Hủy phòng miễn phí
                          </button>
                        )}

                        <p className="text-xs text-green-600 font-medium mt-1">
                          {item.paymentStatus === "Paid"
                            ? "Đã thanh toán"
                            : "Thanh toán tại KS"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
