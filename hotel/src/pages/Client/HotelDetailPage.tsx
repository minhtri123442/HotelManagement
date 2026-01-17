import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  MapPinIcon,
  StarIcon as StarIconSolid,
  ArrowLeftIcon,
  UserGroupIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon, // Import thêm icon
} from "@heroicons/react/24/solid";

const API_BASE = "http://localhost:5134";

export default function HotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [hotel, setHotel] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomLoading, setRoomLoading] = useState(false); // Loading riêng cho phần phòng

  // --- STATE NGÀY THÁNG MẶC ĐỊNH ---
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1))
    .toISOString()
    .split("T")[0];

  const [searchParams, setSearchParams] = useState({
    checkIn: today,
    checkOut: tomorrow,
    adults: 2,
    children: 0,
  });

  // --- HÀM XỬ LÝ ẢNH ---
  const processSingleImageUrl = (imgStr) => {
    if (!imgStr) return "https://via.placeholder.com/400x300?text=No+Image";
    if (imgStr.startsWith("http")) return imgStr;
    return `${API_BASE}${imgStr.startsWith("/") ? "" : "/images/"}${imgStr}`;
  };

  const getGalleryImages = (hotelData) => {
    if (!hotelData) return [];
    let rawImages = [];
    if (hotelData.hotelImages?.length > 0)
      rawImages = hotelData.hotelImages.map((i) => i.imageUrl);
    else if (hotelData.imageUrls?.length > 0) rawImages = hotelData.imageUrls;
    else if (hotelData.images?.length > 0) rawImages = hotelData.images;
    else if (hotelData.imageUrl) rawImages = [hotelData.imageUrl];

    const processed = rawImages.map(processSingleImageUrl);
    // Đảm bảo luôn có ít nhất 1 ảnh hoặc fallback
    return processed.length > 0
      ? processed
      : ["https://via.placeholder.com/800x600?text=No+Image"];
  };

  // --- LOGIC FETCH DỮ LIỆU ---

  // 1. Hàm lấy phòng trống (QUAN TRỌNG)
  const fetchRooms = async (checkInDate, checkOutDate) => {
    setRoomLoading(true);
    try {
      // Gọi API lọc phòng Availability mà chúng ta đã thống nhất ở Backend
      const url = `${API_BASE}/api/RoomTypes/hotel/${id}/available?checkIn=${checkInDate}&checkOut=${checkOutDate}`;
      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        setRoomTypes(data || []);
      } else {
        // Nếu API lỗi hoặc 404 thì coi như không có phòng
        setRoomTypes([]);
      }
    } catch (error) {
      console.error("Lỗi tìm phòng:", error);
      setRoomTypes([]);
    } finally {
      setRoomLoading(false);
    }
  };

  // 2. Load thông tin khách sạn & Phòng lần đầu
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // Lấy thông tin Hotel
        const resHotel = await fetch(`${API_BASE}/api/hotels/${id}`);
        if (!resHotel.ok) throw new Error("Không tìm thấy khách sạn");
        setHotel(await resHotel.json());

        // Lấy phòng theo ngày mặc định (Hôm nay -> Mai)
        await fetchRooms(searchParams.checkIn, searchParams.checkOut);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) initData();
  }, [id]);

  // --- CÁC HÀM TIỆN ÍCH ---
  const getMapUrl = () => {
    if (!hotel) return "";
    if (hotel.mapUrl) return hotel.mapUrl;
    if (hotel.latitude && hotel.longitude) {
      return `http://googleusercontent.com/maps.google.com/maps?q=${hotel.latitude},${hotel.longitude}&hl=vi&z=16&output=embed`;
    }
    const encodedAddr = encodeURIComponent(hotel.address || "");
    return `http://googleusercontent.com/maps.google.com/maps?q=${encodedAddr}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const renderStars = (count) =>
    [...Array(5)].map((_, i) => (
      <StarIconSolid
        key={i}
        className={`w-5 h-5 ${i < count ? "text-yellow-400" : "text-gray-300"}`}
      />
    ));

  const handleGoBack = () => {
    if (location.state?.from) navigate(location.state.from);
    else navigate("/HomePage");
  };

  // --- XỬ LÝ NÚT "KIỂM TRA" ---
  const handleSearchAvailability = () => {
    if (searchParams.checkIn >= searchParams.checkOut) {
      alert("Ngày trả phòng phải sau ngày nhận phòng!");
      return;
    }
    // Gọi lại API fetchRooms với ngày mới
    fetchRooms(searchParams.checkIn, searchParams.checkOut);
  };

  // --- XỬ LÝ ĐẶT PHÒNG ---
  const handleBooking = (roomType) => {
    if (searchParams.checkIn >= searchParams.checkOut) {
      alert("Ngày trả phòng phải sau ngày nhận phòng!");
      return;
    }

    const userStored = localStorage.getItem("user");
    if (!userStored) {
      if (window.confirm("Bạn cần đăng nhập để đặt phòng. Đăng nhập ngay?")) {
        navigate("/login", { state: { from: location.pathname } });
      }
      return;
    }

    const user = JSON.parse(userStored);
    navigate("/client/booking", {
      state: {
        hotelInfo: {
          id: id,
          name: hotel.name,
          address: hotel.address,
          image: getGalleryImages(hotel)[0],
        },
        roomInfo: roomType,
        bookingDetails: searchParams, // Truyền ngày đã chọn sang trang Booking
        userInfo: user,
      },
    });
  };

  // --- RENDER ---
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold">
        Đang tải dữ liệu...
      </div>
    );

  if (!hotel)
    return <div className="text-center pt-20">Không tìm thấy dữ liệu!</div>;

  const galleryImages = getGalleryImages(hotel);
  const mapSrc = getMapUrl();

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-16 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800 truncate">
            {hotel.name}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* GALLERY ẢNH */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[450px] rounded-2xl overflow-hidden mb-8 shadow-sm">
          <div className="md:col-span-2 md:row-span-2 relative bg-gray-200 group">
            <img
              src={galleryImages[0]}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              alt="Main"
            />
          </div>
          {galleryImages.slice(1, 5).map((img, i) => (
            <div
              key={i}
              className="relative hidden md:block bg-gray-200 overflow-hidden group"
            >
              <img
                src={img}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                alt="Sub"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: THÔNG TIN & DANH SÁCH PHÒNG */}
          <div className="lg:col-span-2">
            {/* INFO KHÁCH SẠN */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                {hotel.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {renderStars(hotel.starRating)}
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">
                  Khách sạn
                </span>
              </div>
              <p className="text-gray-500 flex items-start gap-2 text-sm mb-6">
                <MapPinIcon className="w-5 h-5 text-red-500 shrink-0" />
                {hotel.address}
              </p>
              <hr className="my-6 border-gray-100" />
              <h3 className="font-bold text-gray-800 text-lg mb-3">
                Giới thiệu
              </h3>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                {hotel.description}
              </p>
            </div>

            {/* --- THANH TÌM KIẾM PHÒNG (FILTER) --- */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6 sticky top-20 z-30 shadow-md">
              <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
                <div className="flex items-center gap-4 w-full md:w-3/4">
                  <div className="w-1/2">
                    <label className="block text-xs font-bold text-blue-800 mb-1 uppercase">
                      Nhận phòng
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        className="w-full p-2.5 pl-9 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700 bg-white"
                        value={searchParams.checkIn}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          setSearchParams({
                            ...searchParams,
                            checkIn: e.target.value,
                          })
                        }
                      />
                      <CalendarDaysIcon className="w-5 h-5 text-blue-500 absolute left-2 top-3" />
                    </div>
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-bold text-blue-800 mb-1 uppercase">
                      Trả phòng
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        className="w-full p-2.5 pl-9 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700 bg-white"
                        value={searchParams.checkOut}
                        min={searchParams.checkIn}
                        onChange={(e) =>
                          setSearchParams({
                            ...searchParams,
                            checkOut: e.target.value,
                          })
                        }
                      />
                      <CalendarDaysIcon className="w-5 h-5 text-blue-500 absolute left-2 top-3" />
                    </div>
                  </div>
                </div>

                {/* NÚT KIỂM TRA */}
                <button
                  onClick={handleSearchAvailability}
                  disabled={roomLoading}
                  className="w-full md:w-1/4 bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95 h-[46px] flex items-center justify-center gap-2"
                >
                  {roomLoading ? (
                    <span>Đang tìm...</span>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="w-5 h-5" /> Kiểm tra
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* DANH SÁCH PHÒNG */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              Phòng trống{" "}
              <span className="text-sm font-normal bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                {roomTypes.length} loại
              </span>
            </h2>

            <div className="space-y-4">
              {roomLoading ? (
                <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-500">Đang cập nhật phòng trống...</p>
                </div>
              ) : roomTypes.length === 0 ? (
                <div className="bg-white p-10 rounded-xl text-center border border-gray-200 shadow-sm">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarDaysIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-800 text-lg font-bold">
                    Hết phòng trống
                  </p>
                  <p className="text-gray-500 mt-1">
                    Rất tiếc, không tìm thấy phòng nào trong khoảng thời gian
                    này.
                  </p>
                  <p
                    className="text-blue-600 mt-2 text-sm cursor-pointer hover:underline"
                    onClick={() => {
                      // Reset về ngày mai (Logic phụ)
                      setSearchParams({
                        ...searchParams,
                        checkIn: today,
                        checkOut: tomorrow,
                      });
                    }}
                  >
                    Thử chọn ngày khác
                  </p>
                </div>
              ) : (
                roomTypes.map((type) => {
                  const typeName = type.name || type.Name || "Loại phòng";
                  const typePrice = type.basePrice || type.BasePrice || 0;
                  const typeAdults = type.maxAdults || type.MaxAdults || 2;
                  const typeChildren =
                    type.maxChildren || type.MaxChildren || 0;
                  const typeArea = type.roomArea || type.RoomArea || 25;
                  const typeQty = type.quantity || type.Quantity || 0;
                  const typeDesc = type.description || type.Description || "";
                  const typeId = type.roomTypeID || type.RoomTypeID;

                  let displayImg = type.thumbnailUrl || type.ThumbnailUrl;
                  if (!displayImg) {
                    const imgs = type.roomTypeImages || type.RoomTypeImages;
                    if (imgs && imgs.length > 0)
                      displayImg = imgs[0].imageUrl || imgs[0].ImageUrl;
                  }

                  return (
                    <div
                      key={typeId}
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row hover:shadow-md transition group"
                    >
                      {/* Ảnh phòng */}
                      <div className="w-full md:w-64 h-48 md:h-auto bg-gray-200 flex-shrink-0 relative overflow-hidden">
                        <img
                          src={processSingleImageUrl(displayImg)}
                          alt={typeName}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          onError={(e) =>
                            (e.target.src =
                              "https://via.placeholder.com/400x300?text=Room")
                          }
                        />
                      </div>

                      {/* Thông tin phòng */}
                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition">
                            {typeName}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-2 mb-3">
                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                              <UserGroupIcon className="w-4 h-4" /> {typeAdults}{" "}
                              Lớn, {typeChildren} Trẻ
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {typeArea} m²
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                            {typeDesc}
                          </p>
                          <div className="text-green-600 text-sm flex items-center gap-2 font-medium">
                            <CheckCircleIcon className="w-4 h-4" /> Miễn phí hủy
                            phòng
                          </div>
                        </div>
                      </div>

                      {/* Giá & Nút đặt */}
                      <div className="p-5 border-t md:border-t-0 md:border-l border-gray-100 w-full md:w-56 bg-gray-50 flex flex-col justify-center items-end text-right">
                        <p className="text-xs text-gray-500 mb-1">
                          Giá mỗi đêm
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(typePrice)}
                        </p>
                        <p className="text-xs text-gray-400 mb-4">
                          Đã bao gồm thuế & phí
                        </p>
                        <button
                          className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-200"
                          onClick={() => handleBooking(type)}
                        >
                          Đặt ngay
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CỘT PHẢI: BẢN ĐỒ */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-blue-600" /> Vị trí
                </h4>
                <div className="w-full h-56 bg-gray-200 rounded-lg overflow-hidden relative mb-3 border">
                  <iframe
                    title="Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={mapSrc}
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-sm text-gray-600">{hotel.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
