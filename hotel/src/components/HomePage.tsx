import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// CẤU HÌNH ĐƯỜNG DẪN BACKEND
const API_BASE = "http://localhost:5134";
const API_URL = `${API_BASE}/api/hotels`;
const API_LOCATIONS = `${API_BASE}/api/locations`;

export default function HomePage() {
  const [hotels, setHotels] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState(0);

  const renderStars = (count) => {
    return [...Array(5)].map((_, index) => (
      <svg
        key={index}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`w-4 h-4 ${
          index < count ? "text-yellow-400" : "text-gray-200"
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

  const getImageUrl = (hotel) => {
    let displayImage = null;
    if (hotel.imageUrls && hotel.imageUrls.length > 0)
      displayImage = hotel.imageUrls[0];
    else if (hotel.images && hotel.images.length > 0)
      displayImage = hotel.images[0];

    if (!displayImage)
      return "https://via.placeholder.com/400x300?text=No+Image";

    if (displayImage.startsWith("http")) return displayImage;
    if (displayImage.startsWith("/")) return `${API_BASE}${displayImage}`;
    return `${API_BASE}/images/${displayImage}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resHotels, resLocations] = await Promise.all([
          fetch(`${API_URL}?pageSize=30`),
          fetch(API_LOCATIONS),
        ]);

        const dataHotels = await resHotels.json();
        const dataLocations = await resLocations.json();

        if (dataHotels.items) setHotels(dataHotels.items);
        else if (Array.isArray(dataHotels)) setHotels(dataHotels);
        else setHotels([]);

        if (Array.isArray(dataLocations)) setLocations(dataLocations);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredHotels = hotels.filter((h) => {
    const keyword = search.toLowerCase();
    const matchKeyword =
      (h.name && h.name.toLowerCase().includes(keyword)) ||
      (h.address && h.address.toLowerCase().includes(keyword));

    const matchLocation =
      selectedLocationId === 0 ? true : h.locationID === selectedLocationId;

    return matchKeyword && matchLocation;
  });

  const currentLocName =
    locations.find((l) => l.locationID === selectedLocationId)?.locationName ||
    "Điểm đến nổi bật";

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
      {/* 1. HERO BANNER */}
      {/* flex-shrink-0 để đảm bảo banner không bị co lại khi màn hình nhỏ */}
      <div className="relative bg-blue-800 h-[450px] flex items-center justify-center w-full flex-shrink-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${API_BASE}/background/bg-agoda-homepage.png')`,
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="relative z-10 w-full max-w-6xl px-4 text-center mt-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 drop-shadow-lg">
            Tìm chỗ nghỉ tiếp theo của bạn
          </h1>

          <div className="bg-white p-2 md:p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 items-center max-w-4xl mx-auto">
            <div className="flex-1 w-full relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Nhập điểm đến, khách sạn..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-lg text-gray-800 font-medium transition"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-lg shadow-lg whitespace-nowrap">
              TÌM KIẾM
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-10 flex-grow flex flex-col">
        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide mb-4 justify-start xl:justify-center flex-shrink-0">
          <button
            onClick={() => setSelectedLocationId(0)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition border ${
              selectedLocationId === 0
                ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            Tất cả
          </button>
          {locations.map((loc) => (
            <button
              key={loc.locationID}
              onClick={() => setSelectedLocationId(loc.locationID)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition border ${
                selectedLocationId === loc.locationID
                  ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {loc.locationName}
            </button>
          ))}
        </div>

        {/* LOADING & GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl h-80 animate-pulse shadow-sm border border-gray-100"
              ></div>
            ))}
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 flex-shrink-0">
              {currentLocName}
              <span className="text-base font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {filteredHotels.length} chỗ nghỉ
              </span>
            </h2>

            {filteredHotels.length === 0 ? (
              // --- SỬA Ở ĐÂY: flex-grow + h-full ---
              // flex-grow: Tự động chiếm hết khoảng trống còn lại
              // h-full: Đảm bảo chiều cao full 100% của container
              <div className="flex-grow h-full w-full flex flex-col items-center justify-center text-center bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
                <div className="bg-gray-50 p-8 rounded-full mb-6">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png"
                    alt="No data"
                    className="w-28 h-28 opacity-40 grayscale"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Chưa có chỗ nghỉ tại khu vực này
                </h3>
                <p className="text-gray-500 mb-8 max-w-md">
                  Rất tiếc, chúng tôi không tìm thấy khách sạn nào phù hợp với
                  bộ lọc của bạn. Hãy thử chọn địa điểm khác nhé!
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedLocationId(0);
                  }}
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Xem tất cả khách sạn
                </button>
              </div>
            ) : (
              // GRID VIEW
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {filteredHotels.map((h) => (
                  <Link
                    key={h.hotelID}
                    to={`/hotels/detail/${h.hotelID}`}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-2xl border border-gray-200 hover:border-blue-300 transition-all duration-300 overflow-hidden flex flex-col h-full"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={getImageUrl(h)}
                        alt={h.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700 ease-in-out"
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/400x300?text=No+Image")
                        }
                      />
                      {h.status === "Active" && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm tracking-wide">
                          YÊU THÍCH
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-blue-900 text-white w-9 h-9 flex items-center justify-center rounded-lg shadow-lg font-bold text-sm border-2 border-white">
                        {h.starRating ? (h.starRating * 1.8).toFixed(1) : "8.5"}
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex mb-1.5">
                        {renderStars(h.starRating)}
                      </div>
                      <h3 className="font-bold text-gray-800 text-base leading-snug mb-1 group-hover:text-blue-600 transition line-clamp-2">
                        {h.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-3 flex items-start gap-1 line-clamp-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.625a19.055 19.055 0 005.415 2.301l.002.001h.002zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {h.address}
                      </p>
                      <div className="flex-1"></div>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-[10px] text-green-700 font-bold bg-green-100 px-1.5 py-0.5 rounded">
                            Ưu đãi đặc biệt
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 line-through">
                            1.200.000 ₫
                          </p>
                          <div className="flex items-baseline justify-end gap-1">
                            <p className="text-lg font-bold text-red-600">
                              850.000 ₫
                            </p>
                          </div>
                          <p className="text-[10px] text-gray-500 font-medium">
                            chưa bao gồm thuế phí
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
