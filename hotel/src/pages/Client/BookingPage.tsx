import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDaysIcon,
  MapPinIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  MinusIcon,
  PlusIcon,
  PencilSquareIcon,
  QrCodeIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/solid";

const API_BASE = "http://localhost:5134";

// --- CẤU HÌNH NGÂN HÀNG ---
const BANK_INFO = {
  BANK_ID: "ACB",
  ACCOUNT_NO: "28183127",
  ACCOUNT_NAME: "MINH TRI",
  TEMPLATE: "compact",
};

const DEPOSIT_AMOUNT = 500000;

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hotelInfo, roomInfo, bookingDetails } = location.state || {};

  // --- VALIDATE TRUY CẬP ---
  useEffect(() => {
    if (!hotelInfo || !roomInfo || !bookingDetails) {
      // Không return trực tiếp UI ở đây được vì React Hook rules
      // Dùng navigate trong useEffect an toàn hơn
    }
  }, [hotelInfo, roomInfo, bookingDetails]);

  if (!hotelInfo || !roomInfo || !bookingDetails) {
    return (
      <div className="text-center pt-20">
        <p>Vui lòng chọn phòng trước!</p>
        <button
          onClick={() => navigate("/")}
          className="text-blue-600 underline mt-2"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  // --- STATE ---
  // SỬA ĐỔI 1: maxRooms bây giờ là State, mặc định lấy từ trang trước nhưng sẽ update sau
  const [maxRooms, setMaxRooms] = useState(
    roomInfo.quantity || roomInfo.Quantity || 5
  );
  const [isCheckingStock, setIsCheckingStock] = useState(true); // Trạng thái đang check

  const [roomQuantity, setRoomQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState(1);

  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialRequest: "",
  });

  // --- USE EFFECT 1: CHECK PHÒNG TRỐNG THỰC TẾ (NEW) ---
  useEffect(() => {
    const fetchRealStock = async () => {
      setIsCheckingStock(true);
      try {
        const roomId = roomInfo.roomTypeId || roomInfo.id;
        // Format ngày chuẩn YYYY-MM-DD để gửi xuống Backend
        // Lưu ý: bookingDetails.checkIn đang là string 'YYYY-MM-DD' từ input date nên dùng luôn được
        const checkIn = bookingDetails.checkIn;
        const checkOut = bookingDetails.checkOut;

        const res = await fetch(
          `${API_BASE}/api/roomtypes/check-availability?id=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}`
        );

        if (res.ok) {
          const data = await res.json();
          console.log("Số phòng trống thực tế:", data.availableQty);

          setMaxRooms(data.availableQty);

          // Nếu khách đang chọn số lượng > số thực tế -> Reset về 1 hoặc max
          if (roomQuantity > data.availableQty) {
            setRoomQuantity(data.availableQty > 0 ? 1 : 0);
          }
          // Nếu hết phòng -> set về 0
          if (data.availableQty === 0) {
            setRoomQuantity(0);
          }
        }
      } catch (error) {
        console.error("Lỗi check phòng:", error);
      } finally {
        setIsCheckingStock(false);
      }
    };

    fetchRealStock();
  }, [roomInfo, bookingDetails]); // Chạy lại khi thông tin phòng đổi

  // --- USE EFFECT 2: LẤY INFO USER ---
  useEffect(() => {
    const fetchUserInfo = async () => {
      const userStored = localStorage.getItem("user");
      if (userStored) {
        const u = JSON.parse(userStored);
        const userId = u.userID || u.userId || u.id;
        const token = u.token;

        try {
          const res = await fetch(`${API_BASE}/api/customers/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const userData = await res.json();
            setCustomerInfo((prev) => ({
              ...prev,
              fullName: userData.fullName || userData.FullName || "",
              email: userData.email || userData.Email || "",
              phone: userData.phoneNumber || userData.PhoneNumber || "",
            }));
          } else {
            setCustomerInfo((prev) => ({
              ...prev,
              fullName: u.fullName || "",
              email: u.email || "",
              phone: u.phoneNumber || "",
            }));
          }
        } catch (err) {
          console.error("Lỗi lấy thông tin user:", err);
        }
      }
    };
    fetchUserInfo();
  }, []);

  // --- TÍNH TOÁN ---
  const checkInDate = new Date(bookingDetails.checkIn);
  const checkOutDate = new Date(bookingDetails.checkOut);
  const diffTime = Math.abs(checkOutDate - checkInDate);
  const nightCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const pricePerNight = roomInfo.basePrice || roomInfo.BasePrice || 0;
  const totalAmount = pricePerNight * nightCount * roomQuantity;

  // --- HÀM CHUYỂN BƯỚC ---
  const handleNextStep = (e) => {
    e.preventDefault();

    // Validate số lượng phòng
    if (roomQuantity === 0) {
      alert("Rất tiếc, phòng này đã hết trong khoảng thời gian bạn chọn.");
      return;
    }

    if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.email) {
      alert("Vui lòng điền đầy đủ thông tin liên hệ!");
      return;
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const getQRUrl = () => {
    const content = `COC ${customerInfo.phone}`;
    const url = `https://img.vietqr.io/image/${BANK_INFO.BANK_ID}-${
      BANK_INFO.ACCOUNT_NO
    }-${
      BANK_INFO.TEMPLATE
    }.png?amount=${DEPOSIT_AMOUNT}&addInfo=${encodeURIComponent(
      content
    )}&accountName=${encodeURIComponent(BANK_INFO.ACCOUNT_NAME)}`;
    return url;
  };

  // --- XỬ LÝ SUBMIT CUỐI CÙNG ---
  const handleFinalSubmit = async () => {
    setLoading(true);

    const userStored = localStorage.getItem("user");
    const user = userStored ? JSON.parse(userStored) : null;
    const userId = user?.userID || user?.userId || user?.id || 0;

    if (userId === 0) {
      alert("Vui lòng đăng nhập lại.");
      navigate("/login");
      setLoading(false);
      return;
    }

    const contactInfoNote = `
      [THÔNG TIN LIÊN HỆ]
      - Họ tên: ${customerInfo.fullName}
      - Email: ${customerInfo.email}
      - SĐT: ${customerInfo.phone}
      
      [THÔNG TIN THANH TOÁN]
      - Trạng thái: Khách xác nhận ĐÃ CHUYỂN CỌC
      - Số tiền cọc: ${new Intl.NumberFormat("vi-VN").format(DEPOSIT_AMOUNT)} đ
      - Nội dung CK: COC ${customerInfo.phone}
      ---------------------------
      Ghi chú khách: ${customerInfo.specialRequest || "Không có"}
    `;

    const bookingPayload = {
      UserId: userId,
      HotelId: hotelInfo.id || hotelInfo.hotelID,
      BookingDate: new Date().toISOString(),
      CheckInDate: bookingDetails.checkIn,
      CheckOutDate: bookingDetails.checkOut,
      TotalAmount: totalAmount,
      Status: "Pending",
      PaymentStatus: "Unpaid",
      SpecialRequest: contactInfoNote,
      BookingDetails: [
        {
          RoomTypeId: roomInfo.roomTypeId || roomInfo.id,
          Quantity: roomQuantity,
          Price: pricePerNight,
        },
      ],
    };

    try {
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      if (response.ok) {
        alert(
          `Đơn hàng đã được gửi! \nAdmin sẽ kiểm tra khoản cọc ${new Intl.NumberFormat(
            "vi-VN"
          ).format(DEPOSIT_AMOUNT)}đ và liên hệ số ${
            customerInfo.phone
          } để xác nhận.`
        );
        navigate("/");
      } else {
        const errText = await response.text();
        alert(`Lỗi: ${errText}`);
      }
    } catch (error) {
      alert("Lỗi kết nối server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {step === 1 ? (
          <button
            onClick={() => navigate(`/hotels/${hotelInfo.id}`)}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-medium"
          >
            <ArrowLeftIcon className="w-5 h-5" /> Quay lại chi tiết
          </button>
        ) : (
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-medium"
          >
            <ArrowLeftIcon className="w-5 h-5" /> Quay lại điền thông tin
          </button>
        )}

        {/* Tiêu đề & Progress Bar (Giữ nguyên) */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {step === 1 ? "Xác nhận & Điền thông tin" : "Thanh toán đặt cọc"}
          </h1>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span
              className={`px-3 py-1 rounded-full ${
                step === 1
                  ? "bg-blue-600 text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              1. Thông tin
            </span>
            <div className="w-10 h-1 bg-gray-300"></div>
            <span
              className={`px-3 py-1 rounded-full ${
                step === 2
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-500"
              }`}
            >
              2. Đặt cọc
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <>
                {/* KHỐI CHỌN SỐ LƯỢNG (ĐÃ CẬP NHẬT UI KHI HẾT PHÒNG) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                    Thông tin phòng
                  </h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-700">Số lượng phòng</p>

                      {/* SỬA ĐỔI UI HIỂN THỊ SỐ PHÒNG */}
                      <p className="text-sm text-gray-500">
                        {isCheckingStock ? (
                          <span className="text-orange-500 animate-pulse">
                            Đang kiểm tra...
                          </span>
                        ) : (
                          <>
                            Còn trống:{" "}
                            <span
                              className={`font-bold ${
                                maxRooms === 0
                                  ? "text-red-600"
                                  : "text-blue-600"
                              }`}
                            >
                              {maxRooms}
                            </span>
                            {maxRooms === 0 && (
                              <span className="text-red-500 ml-2 font-bold">
                                (Hết phòng)
                              </span>
                            )}
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-10">
                      <button
                        type="button"
                        disabled={roomQuantity <= 1 || maxRooms === 0}
                        onClick={() =>
                          setRoomQuantity((prev) => Math.max(1, prev - 1))
                        }
                        className="w-12 h-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center border-r border-gray-300 disabled:opacity-50"
                      >
                        <MinusIcon className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="w-14 h-full flex items-center justify-center bg-white text-gray-800 font-bold">
                        {roomQuantity}
                      </div>
                      <button
                        type="button"
                        // Disable nếu đã đạt maxRooms hoặc đang check hoặc hết phòng
                        disabled={
                          roomQuantity >= maxRooms ||
                          isCheckingStock ||
                          maxRooms === 0
                        }
                        onClick={() =>
                          setRoomQuantity((prev) =>
                            Math.min(maxRooms, prev + 1)
                          )
                        }
                        className="w-12 h-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center border-l border-gray-300 disabled:opacity-50"
                      >
                        <PlusIcon className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* KHỐI FORM LIÊN HỆ (Giữ nguyên) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-lg font-bold text-gray-800">
                      Thông tin liên hệ
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800"
                    >
                      <PencilSquareIcon className="w-4 h-4" />{" "}
                      {isEditing ? "Xong" : "Chỉnh sửa"}
                    </button>
                  </div>
                  {!isEditing && (
                    <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg">
                      Thông tin từ tài khoản của bạn. Bấm <b>"Chỉnh sửa"</b> nếu
                      đặt hộ.
                    </div>
                  )}
                  <form
                    id="infoForm"
                    onSubmit={handleNextStep}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Họ và tên
                        </label>
                        <input
                          required
                          type="text"
                          disabled={!isEditing}
                          className={`w-full p-2 border rounded-lg outline-none ${
                            !isEditing
                              ? "bg-gray-100 text-gray-500"
                              : "bg-white border-gray-300 focus:ring-2 focus:ring-blue-500"
                          }`}
                          value={customerInfo.fullName}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              fullName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại
                        </label>
                        <input
                          required
                          type="tel"
                          disabled={!isEditing}
                          className={`w-full p-2 border rounded-lg outline-none ${
                            !isEditing
                              ? "bg-gray-100 text-gray-500"
                              : "bg-white border-gray-300 focus:ring-2 focus:ring-blue-500"
                          }`}
                          value={customerInfo.phone}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        required
                        type="email"
                        disabled={!isEditing}
                        className={`w-full p-2 border rounded-lg outline-none ${
                          !isEditing
                            ? "bg-gray-100 text-gray-500"
                            : "bg-white border-gray-300 focus:ring-2 focus:ring-blue-500"
                        }`}
                        value={customerInfo.email}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Yêu cầu đặc biệt
                      </label>
                      <textarea
                        rows="3"
                        className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        value={customerInfo.specialRequest}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            specialRequest: e.target.value,
                          })
                        }
                        placeholder="Nhận phòng sớm..."
                      />
                    </div>
                  </form>
                </div>
              </>
            )}

            {step === 2 && (
              /* --- STEP 2: THANH TOÁN QR (Giữ nguyên logic hiển thị) --- */
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100 animate-fade-in">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                    <QrCodeIcon className="w-6 h-6 text-blue-600" /> Quét mã để
                    đặt cọc
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Vui lòng đặt cọc trước để giữ phòng.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                  <div className="bg-white p-2 rounded-xl shadow-md border border-gray-200">
                    <img
                      src={getQRUrl()}
                      alt="QR Code"
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                  <div className="space-y-4 w-full md:w-auto">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                      {/* Info Bank details... */}
                      <div className="flex justify-between items-center gap-8">
                        <span className="text-gray-500 text-sm">
                          Ngân hàng:
                        </span>
                        <span className="font-bold text-gray-800">
                          {BANK_INFO.BANK_ID}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-8">
                        <span className="text-gray-500 text-sm">
                          Số tiền cọc:
                        </span>
                        <span className="font-bold text-red-600 text-xl">
                          {new Intl.NumberFormat("vi-VN").format(
                            DEPOSIT_AMOUNT
                          )}{" "}
                          đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-8">
                        <span className="text-gray-500 text-sm">Nội dung:</span>
                        <span className="font-mono font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          COC {customerInfo.phone}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 italic text-center max-w-xs mx-auto">
                      *Admin sẽ gọi điện xác nhận trong vòng 15 phút sau khi bạn
                      hoàn tất chuyển khoản.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CỘT PHẢI (Giữ nguyên) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Chi tiết đặt phòng
              </h2>
              <div className="flex gap-3 mb-4">
                <img
                  src={hotelInfo.image}
                  alt="Hotel"
                  className="w-20 h-20 object-cover rounded-lg bg-gray-200"
                />
                <div>
                  <h3 className="font-bold text-gray-800 text-sm line-clamp-2">
                    {hotelInfo.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3" /> {hotelInfo.address}
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-gray-600 border-t border-b border-gray-100 py-4 my-4">
                <div className="flex justify-between">
                  <span>Nhận:</span>
                  <span className="font-bold text-gray-800">
                    {bookingDetails.checkIn}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Trả:</span>
                  <span className="font-bold text-gray-800">
                    {bookingDetails.checkOut}
                  </span>
                </div>
                <div className="flex justify-between bg-gray-50 p-2 rounded">
                  <span className="flex items-center gap-1">
                    <CalendarDaysIcon className="w-4 h-4" /> Thời gian:
                  </span>
                  <span className="font-bold">{nightCount} đêm</span>
                </div>
                <div className="flex justify-between bg-blue-50 p-2 rounded text-blue-800">
                  <span className="flex items-center gap-1">
                    <UserGroupIcon className="w-4 h-4" /> Số lượng:
                  </span>
                  <span className="font-bold">{roomQuantity} phòng</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-blue-600 border-t pt-4 mt-4">
                <span>Tổng tiền:</span>
                <span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(totalAmount)}
                </span>
              </div>

              {step === 1 ? (
                <button
                  form="infoForm"
                  // Disable nút Submit nếu hết phòng hoặc đang check
                  disabled={maxRooms === 0 || isCheckingStock}
                  className="w-full bg-blue-600 text-white font-bold py-3 mt-6 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {maxRooms === 0 ? "HẾT PHÒNG" : "TIẾP TỤC ĐẶT CỌC"}
                </button>
              ) : (
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="w-full bg-green-600 text-white font-bold py-3 mt-6 rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    "Đang xử lý..."
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" /> TÔI ĐÃ CHUYỂN
                      KHOẢN
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
