import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// CẤU HÌNH ĐƯỜNG DẪN BACKEND
const API_BASE = "http://localhost:5134";
const API_URL = `${API_BASE}/api/hotels`;

export default function HotelsList() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(""); // Từ khóa tìm kiếm

  // Helper render sao (SVG)
  const renderStars = (count) => {
    return [...Array(5)].map((_, index) => (
      <svg
        key={index}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`w-4 h-4 ${
          index < count ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        <path
          fillRule="evenodd"
          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
          clipRule="evenodd"
        />
      </svg>
    ));
  };

  // Hàm load danh sách (Chỉ gọi 1 lần khi vào trang)
  const fetchHotels = () => {
    setLoading(true);
    // Gọi API lấy TẤT CẢ khách sạn (không filter ngày tháng gì cả)
    fetch(API_URL)
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`HTTP ${res.status} - ${txt}`);
        }
        return res.json();
      })
      .then((data) => {
        // Xử lý dữ liệu trả về tùy theo backend phân trang hay không
        if (data.items) setHotels(data.items);
        else if (Array.isArray(data)) setHotels(data);
        else setHotels([]);
      })
      .catch((err) => {
        console.error("Lỗi:", err);
        setError(err.message);
        setHotels([]);
      })
      .finally(() => setLoading(false));
  };

  // Load dữ liệu khi component được mount
  useEffect(() => {
    fetchHotels();
  }, []);

  // Hàm xóa
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa khách sạn này?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Đã xóa thành công!");
        fetchHotels(); // Load lại danh sách sau khi xóa
      } else alert("Xóa thất bại");
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  // --- LOGIC LỌC TẠI CLIENT (QUAN TRỌNG) ---
  // Thay vì gọi API search, ta lọc trực tiếp trên mảng 'hotels' đã tải về
  //và việc tìm trên trình duyệt sẽ nhanh hơn là làm hàm store để đợi nó duyệt trên
  //db rồi trả lời lại
  const filteredHotels = hotels.filter((h) => {
    const keyword = search.toLowerCase();
    return (
      h.name.toLowerCase().includes(keyword) || // Tìm theo tên
      h.address.toLowerCase().includes(keyword) || // Tìm theo địa chỉ
      h.hotelID.toString().includes(keyword) // Tìm theo ID
    );
  });

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500 animate-pulse">
        Đang tải dữ liệu...
      </div>
    );
  if (error)
    return <div className="p-10 text-center text-red-500">❌ Lỗi: {error}</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          Quản lý Khách sạn
        </h1>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            {/* Ô tìm kiếm */}
            <input
              type="text"
              placeholder="Tìm tên, địa chỉ, ID..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link
            to="/hotels/add"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow flex items-center gap-1 whitespace-nowrap transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Thêm mới
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-4 py-3 text-center w-16">#</th>
                <th className="px-4 py-3 w-32">Hình ảnh</th>
                <th className="px-4 py-3">Thông tin</th>
                <th className="px-4 py-3 w-32">Đánh giá</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center w-32">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredHotels.map((h, index) => {
                let displayImage = null;
                if (h.imageUrls && h.imageUrls.length > 0) {
                  displayImage = h.imageUrls[0];
                } else if (h.images && h.images.length > 0) {
                  displayImage = h.images[0];
                }

                // [SỬA] Logic tạo đường dẫn ảnh đầy đủ
                let fullImageUrl = "";
                if (displayImage) {
                  // Nếu tên ảnh đã có dấu '/' ở đầu (VD: /images/hcm.jpg) thì chỉ cộng API_BASE
                  if (displayImage.startsWith("/")) {
                    fullImageUrl = `${API_BASE}${displayImage}`;
                  } else {
                    // Nếu chỉ là tên file (VD: photo.jpg) thì cộng thêm /images/
                    fullImageUrl = `${API_BASE}/images/${displayImage}`;
                  }
                }

                // 2. Phải dùng từ khóa 'return' để trả về JSX
                return (
                  <tr
                    key={h.hotelID}
                    className="hover:bg-blue-50 transition duration-150"
                  >
                    <td className="px-4 py-3 text-center text-gray-500 font-mono">
                      {index + 1}
                    </td>

                    {/* --- PHẦN HIỂN THỊ ẢNH ĐÃ SỬA --- */}
                    <td className="px-4 py-3">
                      <div className="w-24 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                        {displayImage ? (
                          <img
                            src={fullImageUrl}
                            alt={h.name}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        ) : (
                          // Icon Placeholder khi không có ảnh
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-8 h-8 text-gray-400"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                            />
                          </svg>
                        )}
                      </div>
                    </td>
                    {/* ---------------------------------- */}

                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-800 text-base">
                        {h.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-3 h-3 text-red-400"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.625a19.055 19.055 0 005.415 2.301l.002.001h.002zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {h.address}, {h.city}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex" title={`${h.starRating} sao`}>
                        {renderStars(h.starRating)}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold border ${
                          h.status === "Active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Nút Xem chi tiết */}
                        <Link
                          to={`/hotels/detail/${h.hotelID}`}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-full transition"
                          title="Xem chi tiết"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </Link>

                        {/* Nút Sửa */}
                        <Link
                          to={`/hotels/edit/${h.hotelID}`}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"
                          title="Sửa"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                            />
                          </svg>
                        </Link>

                        {/* Nút Xóa */}
                        <button
                          onClick={() => handleDelete(h.hotelID)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
                          title="Xóa"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredHotels.length === 0 && (
            <div className="p-10 text-center text-gray-400">
              Không tìm thấy khách sạn nào phù hợp.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
