import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  MapPinIcon,
  StarIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/solid";

const API_BASE = "http://localhost:5134";

interface Hotel {
  hotelID: number;
  name: string;
  address: string;
  starRating: number;
  description: string;
  imageUrl: string;
  basePrice?: number; // Giá thấp nhất của hotel
}

export default function HotelListPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  // Lấy params từ URL
  const locationParam = searchParams.get("location") || "";

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        // Nếu có location thì search, không thì lấy tất cả
        const url = locationParam
          ? `${API_BASE}/api/hotels/search?location=${locationParam}`
          : `${API_BASE}/api/hotels`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setHotels(data);
        }
      } catch (error) {
        console.error("Lỗi tải danh sách khách sạn:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [locationParam]);

  const processImageUrl = (url: string) => {
    if (!url) return "https://via.placeholder.com/400x300?text=No+Image";
    if (url.startsWith("http")) return url;
    return `${API_BASE}/images/${url}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* HEADER TÌM KIẾM TÓM TẮT */}
      <div className="bg-blue-700 text-white py-4 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Kết quả tìm kiếm</h1>
            <p className="text-sm opacity-80">
              {hotels.length} khách sạn tại {locationParam || "tất cả khu vực"}
            </p>
          </div>
          <button
            onClick={() => navigate("/HomePage")}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition"
          >
            Thay đổi tìm kiếm
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR: BỘ LỌC (FILTER) */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 font-bold text-gray-800 border-b pb-2">
              <FunnelIcon className="w-5 h-5 text-blue-600" />
              Bộ lọc phổ biến
            </div>

            {/* Lọc hạng sao */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Hạng sao</h3>
              {[5, 4, 3, 2, 1].map((star) => (
                <label
                  key={star}
                  className="flex items-center gap-3 mb-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex gap-0.5">
                    {[...Array(star)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                    ))}
                  </div>
                </label>
              ))}
            </div>

            {/* Lọc khoảng giá */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">
                Ngân sách (mỗi đêm)
              </h3>
              <input
                type="range"
                min="0"
                max="10000000"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0đ</span>
                <span>10tr+</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT: DANH SÁCH KHÁCH SẠN */}
        <div className="lg:col-span-3 space-y-4">
          {/* THANH SẮP XẾP */}
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex gap-4">
              <button className="text-sm font-bold text-blue-600 border-b-2 border-blue-600 pb-1">
                Đề xuất
              </button>
              <button className="text-sm font-medium text-gray-500 hover:text-blue-600 transition">
                Giá thấp nhất
              </button>
              <button className="text-sm font-medium text-gray-500 hover:text-blue-600 transition">
                Đánh giá cao nhất
              </button>
            </div>
            <ArrowsUpDownIcon className="w-5 h-5 text-gray-400" />
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">
              Đang tải danh sách khách sạn...
            </div>
          ) : hotels.length === 0 ? (
            <div className="bg-white p-20 text-center rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">
                Không tìm thấy khách sạn nào phù hợp.
              </p>
            </div>
          ) : (
            hotels.map((hotel) => (
              <div
                key={hotel.hotelID}
                onClick={() =>
                  navigate(`/hotels/detail/${hotel.hotelID}`, {
                    state: {
                      from: window.location.pathname + window.location.search,
                    },
                  })
                }
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition cursor-pointer group"
              >
                {/* ẢNH KHÁCH SẠN */}
                <div className="w-full md:w-72 h-52 flex-shrink-0 relative overflow-hidden">
                  <img
                    src={processImageUrl(hotel.imageUrl)}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                    BÁN CHẠY
                  </div>
                </div>

                {/* THÔNG TIN */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                        {hotel.name}
                      </h3>
                      <div className="bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded text-sm">
                        8.5
                      </div>
                    </div>

                    <div className="flex gap-0.5 my-1">
                      {[...Array(hotel.starRating)].map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                      ))}
                    </div>

                    <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
                      <MapPinIcon className="w-4 h-4 text-red-500" />
                      {hotel.address}
                    </p>

                    <div className="flex gap-2 mb-3">
                      <span className="text-[11px] bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full font-medium">
                        Wifi miễn phí
                      </span>
                      <span className="text-[11px] bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full font-medium">
                        Hồ bơi
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t pt-4">
                    <div className="text-xs text-green-600 font-bold flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      Hủy miễn phí
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 line-through">
                        1.200.000đ
                      </p>
                      <p className="text-2xl font-black text-red-600">
                        {new Intl.NumberFormat("vi-VN").format(
                          hotel.basePrice || 850000
                        )}{" "}
                        đ
                      </p>
                      <button className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Icon helper đơn giản
function CheckCircleIcon({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  );
}
