import React, { useState, useEffect } from "react";
import axios from "axios";
// --- IMPORT HEROICONS ---
import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid"; // Dùng bản solid cho icon nổi bật

// --- INTERFACES ---
interface CalendarItem {
  date: string;
  price: number;
  availableQty: number;
  isClosed: boolean;
}

interface RoomTypeSimple {
  roomTypeID: number;
  name: string;
  basePrice: number;
  quantity: number;
}

interface HotelSimple {
  hotelID: number;
  name: string;
}

export default function AvailabilityCalendar() {
  const BACKEND_DOMAIN = "http://localhost:5134";

  // --- STATE ---

  // 1. State cho Khách sạn
  const [hotels, setHotels] = useState<HotelSimple[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<number>(0);

  // 2. State cho Loại phòng
  const [roomTypes, setRoomTypes] = useState<RoomTypeSimple[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number>(0);
  const [selectedRoomData, setSelectedRoomData] =
    useState<RoomTypeSimple | null>(null);

  // 3. State cho Lịch & Thời gian
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState<CalendarItem[]>([]);

  // 4. State Form Update (Bulk)
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [newPrice, setNewPrice] = useState<number | "">("");
  const [newQty, setNewQty] = useState<number | "">("");
  const [isClosed, setIsClosed] = useState(false);

  // 5. STATE THÔNG BÁO (NOTIFICATION POPUP) - NEW
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  // --- EFFECTS (LOGIC FLOW) ---

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await axios.get(`${BACKEND_DOMAIN}/api/hotels`);
        const data = Array.isArray(res.data) ? res.data : res.data.items || [];
        setHotels(data);
        if (data.length > 0) {
          const firstId = data[0].hotelID || data[0].id;
          setSelectedHotelId(firstId);
        }
      } catch (error) {
        console.error("Lỗi load hotels:", error);
      }
    };
    fetchHotels();
  }, []);

  useEffect(() => {
    if (!selectedHotelId || selectedHotelId === 0) {
      setRoomTypes([]);
      return;
    }
    const fetchRoomTypes = async () => {
      try {
        setSelectedRoomId(0);
        setSelectedRoomData(null);
        setCalendarData([]);
        const res = await axios.get(
          `${BACKEND_DOMAIN}/api/RoomTypes/hotel/${selectedHotelId}`
        );
        const data = Array.isArray(res.data) ? res.data : res.data.items || [];
        setRoomTypes(data);
        if (data.length > 0) {
          setSelectedRoomId(data[0].roomTypeID);
          setSelectedRoomData(data[0]);
        }
      } catch (error) {
        console.error("Lỗi load room types:", error);
        setRoomTypes([]);
      }
    };
    fetchRoomTypes();
  }, [selectedHotelId]);

  useEffect(() => {
    if (!selectedRoomId || selectedRoomId === 0) return;
    const room = roomTypes.find((r) => r.roomTypeID === Number(selectedRoomId));
    setSelectedRoomData(room || null);
    fetchCalendar();
  }, [selectedRoomId, month, year]);

  const fetchCalendar = async () => {
    if (!selectedRoomId) return;
    try {
      const res = await axios.get(`${BACKEND_DOMAIN}/api/Availability`, {
        params: { roomTypeId: selectedRoomId, month, year },
      });
      setCalendarData(res.data);
    } catch (error) {
      console.error("Lỗi load calendar:", error);
      setCalendarData([]);
    }
  };

  // --- HELPER SHOW NOTIFICATION ---
  const showSuccess = (msg: string) => {
    setNotification({
      isOpen: true,
      type: "success",
      title: "Thành công!",
      message: msg,
    });
  };

  const showError = (msg: string) => {
    setNotification({
      isOpen: true,
      type: "error",
      title: "Đã có lỗi xảy ra",
      message: msg,
    });
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  };

  // --- HANDLERS ---
  const handleBulkUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showError("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc.");
      return;
    }
    if (!selectedRoomId) {
      showError("Vui lòng chọn loại phòng cần cập nhật.");
      return;
    }

    const payload = {
      roomTypeID: selectedRoomId,
      fromDate: fromDate,
      toDate: toDate,
      price: newPrice === "" ? null : newPrice,
      availableQty: newQty === "" ? null : newQty,
      isClosed: isClosed,
    };

    try {
      await axios.post(
        `${BACKEND_DOMAIN}/api/Availability/bulk-update`,
        payload
      );
      // THAY ALERT BẰNG MODAL ĐẸP
      showSuccess("Dữ liệu lịch và giá phòng đã được cập nhật thành công!");
      fetchCalendar();
    } catch (error) {
      console.error(error);
      showError("Không thể cập nhật dữ liệu. Vui lòng kiểm tra lại kết nối.");
    }
  };

  const handleDateClick = (dateStr: string) => {
    setFromDate(dateStr);
    setToDate(dateStr);

    const record = calendarData.find((item) => item.date.startsWith(dateStr));
    if (record) {
      setNewPrice(record.price);
      setNewQty(record.availableQty);
      setIsClosed(record.isClosed);
    } else {
      if (selectedRoomData) {
        setNewPrice(selectedRoomData.basePrice);
        setNewQty(selectedRoomData.quantity);
      } else {
        setNewPrice("");
        setNewQty("");
      }
      setIsClosed(false);
    }
  };

  // --- RENDER HELPERS ---
  const renderCalendarGrid = () => {
    if (!selectedRoomId || selectedRoomId === 0) {
      return (
        <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
          Vui lòng chọn Khách sạn và Loại phòng để xem lịch.
        </div>
      );
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="grid grid-cols-7 gap-2 mt-4">
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
          <div
            key={d}
            className="text-center font-bold text-gray-400 text-xs py-1 bg-gray-100 rounded"
          >
            {d}
          </div>
        ))}

        {daysArray.map((day) => {
          const dateObj = new Date(year, month - 1, day);
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;
          const record = calendarData.find((item) =>
            item.date.startsWith(dateStr)
          );

          const displayPrice = record
            ? record.price
            : selectedRoomData?.basePrice || 0;
          const displayQty = record
            ? record.availableQty
            : selectedRoomData?.quantity || 0;
          const isDayClosed = record ? record.isClosed : false;

          return (
            <div
              key={day}
              className={`border p-2 min-h-[100px] rounded relative transition duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer group
                ${
                  isDayClosed
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-gray-200"
                }
              `}
              onClick={() => handleDateClick(dateStr)}
              style={{
                gridColumnStart:
                  day === 1
                    ? new Date(year, month - 1, 1).getDay() + 1
                    : "auto",
              }}
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-gray-700">{day}</span>
                {isDayClosed && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1 rounded">
                    CLOSE
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1">
                <div className="text-sm font-semibold text-green-700">
                  {new Intl.NumberFormat("vi-VN").format(displayPrice)}đ
                </div>
                <div className="text-xs text-gray-500">
                  Còn:{" "}
                  <span className="font-bold text-blue-600">{displayQty}</span>
                </div>
              </div>

              {/* Highlight border khi click chọn (Optional UX) */}
              <div className="absolute inset-0 border-2 border-blue-500 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 uppercase flex items-center gap-2">
        Quản lý Lịch & Giá phòng
      </h2>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* --- CỘT TRÁI --- */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">
              Bộ lọc dữ liệu
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Khách sạn
              </label>
              <select
                className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedHotelId}
                onChange={(e) => setSelectedHotelId(Number(e.target.value))}
              >
                <option value={0}>-- Chọn khách sạn --</option>
                {hotels.map((h) => (
                  <option key={h.hotelID} value={h.hotelID}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Loại phòng
              </label>
              <select
                className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(Number(e.target.value))}
                disabled={!selectedHotelId || roomTypes.length === 0}
              >
                {roomTypes.length === 0 ? (
                  <option value={0}>-- Không có loại phòng --</option>
                ) : (
                  roomTypes.map((r) => (
                    <option key={r.roomTypeID} value={r.roomTypeID}>
                      {r.name} - (Gốc: {r.basePrice.toLocaleString()}đ)
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div
            className={`bg-white p-6 rounded-lg shadow border border-gray-200 sticky top-4 ${
              !selectedRoomId || selectedRoomId === 0
                ? "opacity-50 pointer-events-none grayscale"
                : ""
            }`}
          >
            <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">
              Cập nhật hàng loạt
            </h3>
            <form onSubmit={handleBulkUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Giá mới
                  </label>
                  <input
                    type="number"
                    className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Giữ nguyên"
                    value={newPrice}
                    onChange={(e) =>
                      setNewPrice(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    className="w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Giữ nguyên"
                    value={newQty}
                    onChange={(e) =>
                      setNewQty(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 bg-red-50 p-2 rounded border border-red-100">
                <input
                  type="checkbox"
                  id="closeRoom"
                  className="w-4 h-4 text-red-600 focus:ring-red-500"
                  checked={isClosed}
                  onChange={(e) => setIsClosed(e.target.checked)}
                />
                <label
                  htmlFor="closeRoom"
                  className="text-sm font-bold text-red-600 cursor-pointer"
                >
                  Đóng phòng (Stop Sell)
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2.5 rounded font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                Lưu thay đổi
              </button>
            </form>
          </div>
        </div>

        {/* --- CỘT PHẢI --- */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex justify-between items-center mb-4">
            <div className="flex gap-4 items-center">
              <button
                onClick={() => {
                  if (month === 1) {
                    setMonth(12);
                    setYear(year - 1);
                  } else {
                    setMonth(month - 1);
                  }
                }}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded hover:bg-blue-100 hover:text-blue-600 transition"
              >
                &lt;
              </button>
              <span className="font-bold text-lg text-gray-800 min-w-[140px] text-center">
                Tháng {month} / {year}
              </span>
              <button
                onClick={() => {
                  if (month === 12) {
                    setMonth(1);
                    setYear(year + 1);
                  } else {
                    setMonth(month + 1);
                  }
                }}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded hover:bg-blue-100 hover:text-blue-600 transition"
              >
                &gt;
              </button>
            </div>
            <div className="flex gap-4 text-xs font-medium text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-white border border-gray-300 rounded-sm"></div>{" "}
                Mở bán
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-50 border border-red-200 rounded-sm"></div>{" "}
                Đóng
              </div>
            </div>
          </div>
          {renderCalendarGrid()}
        </div>
      </div>

      {/* --- NOTIFICATION MODAL --- */}
      {notification.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100 animate-zoom-in text-center">
            {/* ICON */}
            <div
              className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
                notification.type === "success" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              ) : (
                <XCircleIcon className="h-10 w-10 text-red-600" />
              )}
            </div>

            {/* TITLE & MESSAGE */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {notification.title}
            </h3>
            <p className="text-gray-500 mb-6 text-sm">{notification.message}</p>

            {/* BUTTON */}
            <button
              onClick={closeNotification}
              className={`w-full py-2.5 rounded-xl font-bold text-white transition shadow-lg ${
                notification.type === "success"
                  ? "bg-green-600 hover:bg-green-700 shadow-green-200"
                  : "bg-red-600 hover:bg-red-700 shadow-red-200"
              }`}
            >
              Đóng
            </button>

            {/* CLOSE ICON (TOP RIGHT) */}
            <button
              onClick={closeNotification}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
