import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

// --- IMPORT HEROICONS ---
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  UserGroupIcon,
  XMarkIcon, // Dùng để xóa text tìm kiếm
} from "@heroicons/react/24/outline";

// Import StarIcon từ Solid để làm ngôi sao vàng
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
// Import StarIcon từ Outline để làm ngôi sao rỗng (nếu cần)
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";

// CẤU HÌNH ĐƯỜNG DẪN BACKEND
const API_BASE = "http://localhost:5134";
const API_URL = `${API_BASE}/api/hotels`;
const API_LOCATIONS = `${API_BASE}/api/locations`;

export default function HomePage() {
  // --- STATE DỮ LIỆU ---
  const [hotels, setHotels] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE TÌM KIẾM & UI ---
  const [search, setSearch] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState(0);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showGuestPopup, setShowGuestPopup] = useState(false);

  const [dates, setDates] = useState({ checkIn: "", checkOut: "" });
  const [guests, setGuests] = useState({ adult: 2, child: 0, room: 1 });

  const searchContainerRef = useRef(null);
  const guestPopupRef = useRef(null);

  // --- LOGIC XỬ LÝ ẢNH ---
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

  // --- LOGIC RENDER SAO (Dùng Heroicons) ---
  const renderStars = (count) => {
    return [...Array(5)].map((_, index) =>
      index < count ? (
        <StarIconSolid key={index} className="w-3.5 h-3.5 text-yellow-400" />
      ) : (
        <StarIconOutline key={index} className="w-3.5 h-3.5 text-gray-300" />
      )
    );
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resHotels, resLocations] = await Promise.all([
          fetch(`${API_URL}?pageSize=50`),
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

    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
      if (
        guestPopupRef.current &&
        !guestPopupRef.current.contains(event.target)
      ) {
        setShowGuestPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- LOGIC LỌC KHÁCH SẠN ---
  const filteredHotels = hotels.filter((h) => {
    const keyword = search.toLowerCase();
    const matchLocation =
      selectedLocationId === 0 ? true : h.locationID === selectedLocationId;
    const matchKeyword =
      keyword === "" ||
      (h.name && h.name.toLowerCase().includes(keyword)) ||
      (h.address && h.address.toLowerCase().includes(keyword));
    return matchLocation && matchKeyword;
  });

  // --- LOGIC GỢI Ý ---
  const suggestionList = (() => {
    if (!search) return [];
    const keyword = search.toLowerCase();
    const matchedLocations = locations
      .filter((l) => l.locationName.toLowerCase().includes(keyword))
      .slice(0, 3);
    const matchedHotels = hotels
      .filter((h) => h.name.toLowerCase().includes(keyword))
      .slice(0, 5);
    return { locations: matchedLocations, hotels: matchedHotels };
  })();

  const handleSelectSuggestion = (type, item) => {
    if (type === "location") {
      setSearch("");
      setSelectedLocationId(item.locationID);
    } else {
      setSearch(item.name);
      setSelectedLocationId(0);
    }
    setShowSuggestions(false);
  };

  const currentLocName =
    locations.find((l) => l.locationID === selectedLocationId)?.locationName ||
    "Điểm đến nổi bật";

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col relative">
      {/* 1. HERO BANNER */}
      <div className="relative bg-blue-900 pb-40 pt-10 px-4 flex flex-col items-center justify-center w-full flex-shrink-0">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <img
            src={`${API_BASE}/background/bg-agoda-homepage.png`}
            alt="bg"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 text-center mb-6 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-md leading-tight">
            Tìm chỗ nghỉ tuyệt vời cho kỳ nghỉ của bạn
          </h1>
          <p className="text-gray-200 text-lg md:text-xl font-light">
            Khám phá các ưu đãi khách sạn, chỗ nghỉ dạng nhà và nhiều hơn nữa...
          </p>
        </div>

        {/* --- THANH TÌM KIẾM 2 TẦNG --- */}
        <div className="absolute -bottom-0 md:bottom-0 translate-y-1/2 z-50 w-full max-w-5xl px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border border-gray-200">
            {/* --- TẦNG 1: Ô TÌM KIẾM --- */}
            <div className="relative w-full z-20" ref={searchContainerRef}>
              <div
                className="flex items-center bg-gray-100 rounded-lg px-4 py-3 hover:bg-gray-50 transition border border-transparent hover:border-blue-300 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 cursor-text"
                onClick={() => {
                  document.getElementById("searchInput").focus();
                  setShowSuggestions(true);
                }}
              >
                {/* ICON MAGNIFYING GLASS */}
                <div className="bg-blue-100 p-2 rounded-full mr-3 text-blue-600">
                  <MagnifyingGlassIcon className="w-6 h-6" />
                </div>

                <div className="flex-grow">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">
                    Điểm đến của bạn
                  </label>
                  <input
                    id="searchInput"
                    type="text"
                    placeholder="Nhập tên thành phố, địa điểm hoặc khách sạn..."
                    className="w-full bg-transparent outline-none text-gray-800 text-lg font-semibold placeholder-gray-400"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setSelectedLocationId(0);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    autoComplete="off"
                  />
                </div>

                {search && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearch("");
                      setSelectedLocationId(0);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    {/* ICON X MARK */}
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* SUGGESTIONS DROPDOWN */}
              {showSuggestions && search.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white rounded-xl shadow-xl mt-2 overflow-hidden border border-gray-100 z-50 animate-fadeIn">
                  {suggestionList.locations.length > 0 && (
                    <div className="py-2">
                      <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Địa điểm
                      </div>
                      {suggestionList.locations.map((loc) => (
                        <div
                          key={loc.locationID}
                          onClick={() =>
                            handleSelectSuggestion("location", loc)
                          }
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition border-b border-gray-50 last:border-0"
                        >
                          <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                            {/* ICON MAP PIN */}
                            <MapPinIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-base">
                              {loc.locationName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Thành phố nổi bật
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {suggestionList.hotels.length > 0 && (
                    <div className="py-2 border-t border-gray-100">
                      <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Khách sạn
                      </div>
                      {suggestionList.hotels.map((h) => (
                        <div
                          key={h.hotelID}
                          onClick={() => handleSelectSuggestion("hotel", h)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition border-b border-gray-50 last:border-0"
                        >
                          <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                            {/* ICON BUILDING */}
                            <BuildingOffice2Icon className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-bold text-gray-800 text-base truncate">
                              {h.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {h.address}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* --- TẦNG 2 --- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* 1. DATE PICKER */}
              <div className="md:col-span-5 flex items-center bg-gray-100 rounded-lg px-4 py-2 hover:bg-gray-50 transition border border-transparent hover:border-blue-300 cursor-pointer">
                <div className="text-gray-500 mr-3">
                  {/* ICON CALENDAR */}
                  <CalendarDaysIcon className="w-6 h-6" />
                </div>
                <div className="flex flex-col w-full">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Nhận phòng - Trả phòng
                  </span>
                  <input
                    type="date"
                    className="w-full bg-transparent outline-none text-gray-800 font-semibold p-0 cursor-pointer"
                    onChange={(e) =>
                      setDates({ ...dates, checkIn: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* 2. GUEST SELECTOR */}
              <div className="md:col-span-4 relative" ref={guestPopupRef}>
                <div
                  className="flex items-center h-full bg-gray-100 rounded-lg px-4 py-2 hover:bg-gray-50 transition border border-transparent hover:border-blue-300 cursor-pointer"
                  onClick={() => setShowGuestPopup(!showGuestPopup)}
                >
                  <div className="text-gray-500 mr-3">
                    {/* ICON USER GROUP */}
                    <UserGroupIcon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Số khách
                    </span>
                    <span className="text-gray-800 font-semibold truncate">
                      {guests.adult} lớn, {guests.child} trẻ, {guests.room}{" "}
                      phòng
                    </span>
                  </div>
                </div>

                {showGuestPopup && (
                  <div className="absolute top-full right-0 w-72 bg-white rounded-lg shadow-xl mt-2 p-4 border border-gray-100 z-50 animate-fadeIn">
                    {[
                      {
                        label: "Người lớn",
                        sub: "18 tuổi trở lên",
                        key: "adult",
                        min: 1,
                      },
                      {
                        label: "Trẻ em",
                        sub: "0 - 17 tuổi",
                        key: "child",
                        min: 0,
                      },
                      { label: "Phòng", sub: "", key: "room", min: 1 },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <p className="font-bold text-gray-800">
                            {item.label}
                          </p>
                          {item.sub && (
                            <p className="text-xs text-gray-400">{item.sub}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            className={`w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center ${
                              guests[item.key] <= item.min
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:border-blue-500 hover:text-blue-500"
                            }`}
                            onClick={() =>
                              setGuests({
                                ...guests,
                                [item.key]: Math.max(
                                  item.min,
                                  guests[item.key] - 1
                                ),
                              })
                            }
                            disabled={guests[item.key] <= item.min}
                          >
                            -
                          </button>
                          <span className="w-4 text-center font-bold text-gray-700">
                            {guests[item.key]}
                          </span>
                          <button
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500"
                            onClick={() =>
                              setGuests({
                                ...guests,
                                [item.key]: guests[item.key] + 1,
                              })
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowGuestPopup(false)}
                      className="w-full mt-2 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition"
                    >
                      Xong
                    </button>
                  </div>
                )}
              </div>

              {/* 3. BUTTON SEARCH */}
              <div className="md:col-span-3">
                <button className="w-full h-full min-h-[50px] bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95">
                  TÌM KIẾM
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="w-full px-4 sm:px-8 lg:px-12 pt-40 pb-10 flex-grow flex flex-col bg-white">
        {/* LOCATION FILTERS */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-4 justify-start">
          <button
            onClick={() => {
              setSelectedLocationId(0);
              setSearch("");
            }}
            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border ${
              selectedLocationId === 0
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
            }`}
          >
            Tất cả
          </button>
          {locations.map((loc) => (
            <button
              key={loc.locationID}
              onClick={() => {
                setSelectedLocationId(loc.locationID);
                setSearch("");
              }}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border ${
                selectedLocationId === loc.locationID
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
              }`}
            >
              {loc.locationName}
            </button>
          ))}
        </div>

        {/* LOADING & GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-xl h-72 animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                {currentLocName}
                {filteredHotels.length > 0 && (
                  <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {filteredHotels.length} kết quả
                  </span>
                )}
              </h2>
            </div>

            {filteredHotels.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png"
                  alt="No data"
                  className="w-20 h-20 opacity-30 grayscale mb-4"
                />
                <h3 className="text-lg font-bold text-gray-700">
                  Không tìm thấy khách sạn nào
                </h3>
                <p className="text-gray-500 text-sm">
                  Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pb-10">
                {filteredHotels.map((h) => (
                  <Link
                    key={h.hotelID}
                    to={`/hotels/detail/${h.hotelID}`}
                    className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={getImageUrl(h)}
                        alt={h.name}
                        className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/400x300?text=No+Image")
                        }
                      />
                      {h.status === "Active" && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                          HOT
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-blue-800 px-2 py-1 rounded text-xs font-bold shadow-sm flex items-center gap-1">
                        <span>
                          {h.starRating
                            ? (h.starRating * 1.8).toFixed(1)
                            : "8.5"}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 flex flex-col flex-1">
                      <div className="flex mb-1">
                        {renderStars(h.starRating)}
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1 group-hover:text-blue-600 transition line-clamp-2">
                        {h.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1 truncate">
                        {/* ICON MAP PIN MINI */}
                        <MapPinIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        {h.address}
                      </p>

                      <div className="mt-auto pt-2 border-t border-gray-100">
                        <div className="text-right">
                          <p className="text-xs text-gray-400 line-through">
                            1.200.000 ₫
                          </p>
                          <p className="text-lg font-bold text-red-600 leading-none">
                            850.000 ₫
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
