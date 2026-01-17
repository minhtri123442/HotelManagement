import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

// --- IMPORT HEROICONS ---
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  UserGroupIcon,
  MinusCircleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";

// CẤU HÌNH API
const API_BASE = "http://localhost:5134";
const API_SEARCH = `${API_BASE}/api/hotels/search`;
const API_LOCATIONS = `${API_BASE}/api/locations`;
const API_HOTELS_DEFAULT = `${API_BASE}/api/hotels`;

export default function HomePage() {
  const navigate = useNavigate();

  // --- STATE ---
  const [hotels, setHotels] = useState([]);
  const [allHotels, setAllHotels] = useState([]);
  const [locations, setLocations] = useState([]); // Lấy từ API
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Tất cả");

  // SEARCH PARAMS
  const [keyword, setKeyword] = useState("");
  const [dates, setDates] = useState({ checkIn: "", checkOut: "" });
  const [guests, setGuests] = useState({ adult: 2, child: 0, room: 1 });

  // UI STATE
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const searchContainerRef = useRef(null);
  const guestPopupRef = useRef(null);

  // --- 1. INITIAL LOAD (Lấy Hotels và Locations từ Database) ---
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [resHotels, resLocations] = await Promise.all([
          fetch(`${API_HOTELS_DEFAULT}?pageSize=100`),
          fetch(API_LOCATIONS),
        ]);
        const dataHotels = await resHotels.json();
        const dataLocations = await resLocations.json();

        const items =
          dataHotels.items || (Array.isArray(dataHotels) ? dataHotels : []);
        const locItems = Array.isArray(dataLocations)
          ? dataLocations
          : dataLocations.items || [];

        setHotels(items.slice(0, 12));
        setAllHotels(items);
        setLocations(locItems);
      } catch (err) {
        console.error("Lỗi tải trang chủ:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // --- 2. XỬ LÝ SEARCH (Bắt lỗi trống) ---
  const handleSearch = () => {
    if (!keyword.trim()) {
      alert("Vui lòng nhập tên thành phố hoặc khách sạn để tìm kiếm!");
      document.getElementById("searchInput")?.focus();
      return;
    }

    if (
      dates.checkIn &&
      dates.checkOut &&
      new Date(dates.checkIn) >= new Date(dates.checkOut)
    ) {
      alert("Ngày trả phòng phải sau ngày nhận phòng!");
      return;
    }

    const params = new URLSearchParams({
      location: keyword,
      checkIn: dates.checkIn || "",
      checkOut: dates.checkOut || "",
      adults: guests.adult.toString(),
      children: guests.child.toString(),
      rooms: guests.room.toString(),
    });

    navigate(`/hotels?${params.toString()}`);
  };

  // --- 3. XỬ LÝ LỌC THEO LOCATION ID (CHÍNH XÁC TUYỆT ĐỐI) ---
  const filterByCity = (cityName) => {
    setSelectedCity(cityName);

    if (cityName === "Tất cả") {
      setHotels(allHotels.slice(0, 12));
      return;
    }

    // 1. Tìm theo ID (Sửa tất cả ID thành Id cho khớp API)
    const targetLoc = locations.find((l) => l.locationName === cityName);

    if (targetLoc) {
      // Lưu ý: h.locationId hay h.locationID phụ thuộc vào API /api/hotels của bro
      // Nếu hotels trả về locationId (d thường) thì dùng d thường
      const filtered = allHotels.filter(
        (h) => (h.locationId || h.locationID) === targetLoc.locationId
      );

      if (filtered.length > 0) {
        setHotels(filtered);
        return;
      }
    }

    // 2. Logic tìm kiếm mờ dự phòng (Giữ nguyên)
    const searchKeyword = cityName
      .replace("Thành phố ", "")
      .replace("TP. ", "")
      .toLowerCase();

    const filteredByAddress = allHotels.filter((h) => {
      const address = h.address?.toLowerCase() || "";
      const hotelName = h.name?.toLowerCase() || "";
      return (
        address.includes(searchKeyword) || hotelName.includes(searchKeyword)
      );
    });

    setHotels(filteredByAddress);
  };

  // --- 4. LOGIC LẤY HÌNH ẢNH ---
  const getImageUrl = (hotel) => {
    if (hotel.imageUrl) return hotel.imageUrl;
    let displayImage = null;
    if (hotel.imageUrls?.length > 0) displayImage = hotel.imageUrls[0];
    else if (hotel.images?.length > 0) displayImage = hotel.images[0];
    else if (hotel.hotelImages?.length > 0)
      displayImage = hotel.hotelImages[0].imageUrl;

    if (!displayImage)
      return "https://via.placeholder.com/400x300?text=No+Image";
    if (displayImage.startsWith("http")) return displayImage;
    return `${API_BASE}${
      displayImage.startsWith("/") ? "" : "/images/"
    }${displayImage}`;
  };

  const renderStars = (count) => {
    return [...Array(5)].map((_, i) =>
      i < count ? (
        <StarIconSolid key={i} className="w-3.5 h-3.5 text-yellow-400" />
      ) : (
        <StarIconOutline key={i} className="w-3.5 h-3.5 text-gray-300" />
      )
    );
  };

  const suggestionList = (() => {
    if (!keyword) return { locations: [], hotels: [] };
    const k = keyword.toLowerCase();
    return {
      locations: locations
        .filter((l) => l.locationName.toLowerCase().includes(k))
        .slice(0, 3),
      hotels: allHotels
        .filter((h) => h.name.toLowerCase().includes(k))
        .slice(0, 5),
    };
  })();

  const CounterControl = ({ label, value, field, min }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <span className="font-bold text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          className={`p-1 rounded-full border border-gray-300 ${
            value <= min
              ? "opacity-30 cursor-not-allowed"
              : "hover:border-blue-500 hover:text-blue-500"
          }`}
          onClick={() =>
            value > min && setGuests({ ...guests, [field]: value - 1 })
          }
          disabled={value <= min}
        >
          <MinusCircleIcon className="w-6 h-6" />
        </button>
        <span className="w-4 text-center font-bold text-gray-800">{value}</span>
        <button
          className="p-1 rounded-full border border-gray-300 hover:border-blue-500 hover:text-blue-500"
          onClick={() => setGuests({ ...guests, [field]: value + 1 })}
        >
          <PlusCircleIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col relative">
      <div className="relative bg-blue-900 pb-40 pt-12 px-4 flex flex-col items-center justify-center w-full">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <img
            src={`${API_BASE}/background/bg-agoda-homepage.png`}
            alt="bg"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-20 text-center mb-6 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-md tracking-tight">
            Tìm chỗ nghỉ tuyệt vời tiếp theo
          </h1>
        </div>

        <div className="absolute -bottom-0 translate-y-1/2 z-50 w-full max-w-5xl px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border border-gray-200">
            <div className="relative w-full z-20" ref={searchContainerRef}>
              <div
                className="flex items-center bg-gray-100 rounded-lg px-4 py-3 border-2 border-transparent focus-within:bg-white focus-within:border-blue-500 transition cursor-text"
                onClick={() => {
                  document.getElementById("searchInput").focus();
                  setShowSuggestions(true);
                }}
              >
                <MagnifyingGlassIcon className="w-6 h-6 text-gray-500 mr-3" />
                <div className="flex-grow">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">
                    Địa điểm hoặc Tên khách sạn
                  </label>
                  <input
                    id="searchInput"
                    type="text"
                    placeholder="Bạn muốn đi đâu?"
                    className="w-full bg-transparent outline-none text-gray-800 text-lg font-bold"
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                  />
                </div>
              </div>
              {showSuggestions && keyword.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white rounded-xl shadow-xl mt-2 overflow-hidden border border-gray-100 z-50">
                  {suggestionList.locations.map((loc) => (
                    <div
                      key={loc.locationId}
                      onClick={() => {
                        setKeyword(loc.locationName);
                        setShowSuggestions(false);
                      }}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-b border-gray-50"
                    >
                      <MapPinIcon className="w-5 h-5 text-blue-500" />
                      <span className="font-bold text-gray-800">
                        {loc.locationName}
                      </span>
                    </div>
                  ))}
                  {suggestionList.hotels.map((h) => (
                    <div
                      key={h.hotelID}
                      onClick={() => {
                        setKeyword(h.name);
                        setShowSuggestions(false);
                      }}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3"
                    >
                      <BuildingOffice2Icon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-bold text-gray-800">{h.name}</p>
                        <p className="text-xs text-gray-500">{h.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6 flex items-center bg-gray-100 rounded-lg px-4 py-2 border">
                <CalendarDaysIcon className="w-6 h-6 text-gray-500 mr-3" />
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="date"
                    className="bg-transparent outline-none text-gray-800 font-bold text-sm w-full"
                    onChange={(e) =>
                      setDates({ ...dates, checkIn: e.target.value })
                    }
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="date"
                    className="bg-transparent outline-none text-gray-800 font-bold text-sm w-full"
                    onChange={(e) =>
                      setDates({ ...dates, checkOut: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="md:col-span-3 relative" ref={guestPopupRef}>
                <div
                  className="flex items-center h-full bg-gray-100 rounded-lg px-4 py-2 cursor-pointer border"
                  onClick={() => setShowGuestPopup(!showGuestPopup)}
                >
                  <UserGroupIcon className="w-6 h-6 text-gray-500 mr-3" />
                  <span className="text-gray-800 font-bold text-sm truncate">
                    {guests.adult} lớn, {guests.room} phòng
                  </span>
                </div>
                {showGuestPopup && (
                  <div className="absolute top-full right-0 w-72 bg-white rounded-lg shadow-xl mt-2 p-4 border border-gray-100 z-50">
                    <CounterControl
                      label="Người lớn"
                      value={guests.adult}
                      field="adult"
                      min={1}
                    />
                    <CounterControl
                      label="Trẻ em"
                      value={guests.child}
                      field="child"
                      min={0}
                    />
                    <CounterControl
                      label="Phòng"
                      value={guests.room}
                      field="room"
                      min={1}
                    />
                    <button
                      onClick={() => setShowGuestPopup(false)}
                      className="w-full mt-3 py-2 bg-blue-600 text-white font-bold rounded"
                    >
                      Xong
                    </button>
                  </div>
                )}
              </div>
              <div className="md:col-span-3">
                <button
                  onClick={handleSearch}
                  className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg shadow-lg transition active:scale-95"
                >
                  TÌM KIẾM
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-8 lg:px-12 pt-48 pb-20">
        <div className="mb-10">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <MapPinIcon className="w-6 h-6 text-blue-600" />
            Khám phá các điểm đến phổ biến
          </h2>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => filterByCity("Tất cả")}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all border ${
                selectedCity === "Tất cả"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              Tất cả
            </button>

            {/* CÁC NÚT LỌC LẤY ĐỘNG TỪ DATABASE */}
            {locations.map((loc) => (
              <button
                key={loc.locationId}
                onClick={() => filterByCity(loc.locationName)}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all border ${
                  selectedCity === loc.locationName
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                }`}
              >
                {loc.locationName}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {hotels.map((h) => (
            <Link
              to={`/hotels/${h.hotelID}`}
              state={{
                from: "/", // Để biết đường quay lại
                searchParams: {
                  // TRUYỀN DỮ LIỆU TÌM KIẾM SANG
                  checkIn:
                    dates.checkIn || new Date().toISOString().split("T")[0],
                  checkOut:
                    dates.checkOut ||
                    new Date(Date.now() + 86400000).toISOString().split("T")[0],
                  adults: guests.adult,
                  children: guests.child,
                  rooms: guests.room,
                },
              }}
              key={h.hotelID}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={getImageUrl(h)}
                  alt={h.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-black text-blue-600 shadow-sm uppercase">
                  Khuyến mãi
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition text-lg line-clamp-1">
                    {h.name}
                  </h3>
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-1.5 py-0.5 rounded">
                    8.5
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                  <MapPinIcon className="w-3 h-3" /> {h.address}
                </p>
                <div className="flex text-yellow-400 mb-6">
                  {renderStars(h.starRating)}
                </div>
                <div className="mt-auto flex justify-between items-end border-t border-gray-50 pt-4">
                  <div className="text-[10px] text-green-600 font-bold">
                    Hủy miễn phí
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {hotels.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <img
              src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png"
              alt="No data"
              className="w-16 h-16 opacity-20 mb-4"
            />
            <p className="text-gray-400 font-bold text-lg">
              Rất tiếc, chưa có khách sạn tại khu vực này.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
