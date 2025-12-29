import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// --- IMPORT HEROICONS ---
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PhotoIcon,
  MapPinIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// Import sao đặc (Solid) để làm sao vàng, sao rỗng (Outline) để làm sao xám
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";

// CẤU HÌNH ĐƯỜNG DẪN BACKEND
const API_BASE = "http://localhost:5134";
const API_URL = `${API_BASE}/api/hotels`;

export default function HotelsList() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(""); // Từ khóa tìm kiếm

  // Helper render sao (Sử dụng Heroicons)
  const renderStars = (count) => {
    return [...Array(5)].map((_, index) =>
      index < count ? (
        <StarIconSolid key={index} className="w-4 h-4 text-yellow-400" />
      ) : (
        <StarIconOutline key={index} className="w-4 h-4 text-gray-300" />
      )
    );
  };

  // Hàm load danh sách
  const fetchHotels = () => {
    setLoading(true);
    fetch(API_URL)
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`HTTP ${res.status} - ${txt}`);
        }
        return res.json();
      })
      .then((data) => {
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
        fetchHotels();
      } else alert("Xóa thất bại");
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  // Logic lọc tại Client
  const filteredHotels = hotels.filter((h) => {
    const keyword = search.toLowerCase();
    return (
      h.name.toLowerCase().includes(keyword) ||
      h.address.toLowerCase().includes(keyword) ||
      h.hotelID.toString().includes(keyword)
    );
  });

  // Helper xử lý đường dẫn ảnh đồng bộ với Cloudinary
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Nếu là link Cloudinary hoặc link web (https:// hoặc http://) -> Trả về luôn
    if (imagePath.startsWith("http")) return imagePath;
    // Fallback cho dữ liệu cũ lưu trong source local
    return `${API_BASE}/Hotel_Image/${imagePath.replace(/^\/+/, "")}`;
  };
  if (loading)
    return (
      <div className="p-10 text-center text-gray-500 animate-pulse flex flex-col items-center">
        <MagnifyingGlassIcon className="w-10 h-10 mb-2 opacity-50" />
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
              {/* ICON SEARCH */}
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
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
            to="/admin/hotels/add"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow flex items-center gap-1 whitespace-nowrap transition"
          >
            {/* ICON PLUS */}
            <PlusIcon className="w-5 h-5" />
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
                // Lấy ảnh đầu tiên (thường là ảnh Main) từ mảng imageUrls hoặc images
                const rawImage =
                  (h.imageUrls && h.imageUrls[0]) || (h.images && h.images[0]);
                const fullImageUrl = getImageUrl(rawImage);

                return (
                  <tr
                    key={h.hotelID}
                    className="hover:bg-blue-50 transition duration-150"
                  >
                    <td className="px-4 py-3 text-center text-gray-500 font-mono">
                      {index + 1}
                    </td>

                    {/* --- CỘT HÌNH ẢNH --- */}
                    <td className="px-4 py-3">
                      <div className="w-24 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400">
                        {fullImageUrl ? (
                          <img
                            src={fullImageUrl}
                            alt={h.name}
                            className="w-full h-full object-cover"
                            // Placeholder nếu link ảnh chết
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/150?text=No+Image";
                            }}
                          />
                        ) : (
                          <PhotoIcon className="w-8 h-8 text-gray-300" />
                        )}
                      </div>
                    </td>

                    {/* ... các cột khác (Thông tin, Đánh giá, Trạng thái...) giữ nguyên ... */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-800 text-base">
                        {h.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MapPinIcon className="w-3.5 h-3.5 text-red-500" />
                        {h.address}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex">{renderStars(h.starRating)}</div>
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
                        <Link
                          to={`/admin/hotels/detail/${h.hotelID}`}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-full transition"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/admin/hotels/edit/${h.hotelID}`}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(h.hotelID)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredHotels.length === 0 && (
            <div className="p-10 text-center text-gray-400 flex flex-col items-center">
              <MagnifyingGlassIcon className="w-12 h-12 mb-2 opacity-20" />
              Không tìm thấy khách sạn nào phù hợp.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
