import React, { useState, useEffect } from "react";
import axios from "axios";
// import { useParams } from "react-router-dom"; // Không dùng ở đây nữa vì ta chọn qua combobox

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

  // 1. State cho Khách sạn (New)
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

  // --- EFFECTS (LOGIC FLOW) ---

  // BƯỚC 1: Load danh sách Khách sạn khi vào trang
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await axios.get(`${BACKEND_DOMAIN}/api/hotels`);
        // Lưu ý: API này cần trả về List Hotel. Nếu trả về PagedList thì cần trỏ vào res.data.items
        const data = Array.isArray(res.data) ? res.data : res.data.items || [];

        setHotels(data);

        // Tự động chọn khách sạn đầu tiên nếu có
        if (data.length > 0) {
          // Check logic lấy ID chính xác (hotelID hay id)
          const firstId = data[0].hotelID || data[0].id;
          setSelectedHotelId(firstId);
        }
      } catch (error) {
        console.error("Lỗi load hotels:", error);
      }
    };
    fetchHotels();
  }, []);

  // BƯỚC 2: Khi Hotel thay đổi -> Load danh sách Loại phòng
  useEffect(() => {
    if (!selectedHotelId || selectedHotelId === 0) {
      setRoomTypes([]);
      return;
    }

    const fetchRoomTypes = async () => {
      try {
        // Reset phòng đang chọn để tránh query sai
        setSelectedRoomId(0);
        setSelectedRoomData(null);
        setCalendarData([]);

        const res = await axios.get(
          `${BACKEND_DOMAIN}/api/RoomTypes/hotel/${selectedHotelId}`
        );
        const data = Array.isArray(res.data) ? res.data : res.data.items || [];

        setRoomTypes(data);

        // Tự động chọn loại phòng đầu tiên nếu có
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

  // BƯỚC 3: Khi RoomType/Tháng/Năm thay đổi -> Load dữ liệu Lịch
  useEffect(() => {
    if (!selectedRoomId || selectedRoomId === 0) return;

    // Cập nhật thông tin phòng cơ bản (để hiển thị giá gốc UI)
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

  // --- HANDLERS ---
  const handleBulkUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) return alert("Vui lòng chọn ngày!");
    if (!selectedRoomId) return alert("Vui lòng chọn loại phòng!");

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
      alert("Cập nhật thành công!");
      fetchCalendar(); // Refresh lại lịch
    } catch (error) {
      console.error(error);
      alert("Lỗi cập nhật. Kiểm tra console.");
    }
  };

  const handleDateClick = (dateStr: string) => {
    setFromDate(dateStr);
    setToDate(dateStr);
  };

  // --- RENDER HELPERS ---
  const renderCalendarGrid = () => {
    // Nếu chưa chọn phòng thì không hiển thị lưới
    if (!selectedRoomId || selectedRoomId === 0) {
      return (
        <div className="p-8 text-center text-gray-400">
          Vui lòng chọn Khách sạn và Loại phòng để xem lịch.
        </div>
      );
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="grid grid-cols-7 gap-2 mt-4">
        {/* Header Thứ trong tuần (Optional) */}
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
          <div
            key={d}
            className="text-center font-bold text-gray-400 text-xs py-1 bg-gray-100 rounded"
          >
            {d}
          </div>
        ))}

        {daysArray.map((day) => {
          // Logic tính toán ngày như cũ
          const dateObj = new Date(year, month - 1, day);
          // Căn chỉnh ô trống cho ngày đầu tháng để đúng thứ
          if (day === 1) {
            const startDay = dateObj.getDay(); // 0 is Sunday
            // Code căn chỉnh grid start col (nếu cần thiết, ở đây dùng grid thuần cho đơn giản)
          }

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
              className={`border p-2 min-h-[100px] rounded relative transition hover:shadow-md cursor-pointer group
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
              }} // Fix hiển thị đúng thứ
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

              {/* Tooltip hint click */}
              <div className="absolute inset-0 bg-blue-500 bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                <span className="text-xs font-bold text-blue-700">Chọn</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 uppercase flex items-center gap-2">
        📅 Quản lý Lịch & Giá phòng
      </h2>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* --- CỘT TRÁI: FORM CẬP NHẬT & BỘ LỌC --- */}
        <div className="w-full lg:w-1/3 space-y-6">
          {/* 1. SECTION CHỌN (Khách sạn & Phòng) */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">
              Bộ lọc dữ liệu
            </h3>

            {/* SELECT KHÁCH SẠN */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                🏢 Khách sạn
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

            {/* SELECT LOẠI PHÒNG */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                🛌 Loại phòng
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

          {/* 2. SECTION FORM CẬP NHẬT (Chỉ hiện khi đã chọn phòng) */}
          <div
            className={`bg-white p-6 rounded-lg shadow border border-gray-200 sticky top-4 ${
              !selectedRoomId || selectedRoomId === 0
                ? "opacity-50 pointer-events-none grayscale"
                : ""
            }`}
          >
            <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">
              🛠️ Cập nhật hàng loạt
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

        {/* --- CỘT PHẢI: LỊCH HIỂN THỊ --- */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex justify-between items-center mb-4">
            <div className="flex gap-4 items-center">
              <button
                onClick={() => {
                  // Logic lùi tháng: Nếu tháng 1 thì về tháng 12 năm ngoái
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
                  // Logic tiến tháng: Nếu tháng 12 thì lên tháng 1 năm sau
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

          {/* Grid Render */}
          {renderCalendarGrid()}
        </div>
      </div>
    </div>
  );
}
