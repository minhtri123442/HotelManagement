import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

// 1. DTO: Image
interface RoomImage {
  roomImageID: number;
  imageUrl: string;
  caption?: string;
}

// 2. DTO: RoomType
interface RoomType {
  roomTypeID: number;
  name: string;
  basePrice: number;
  maxAdults: number;
  maxChildren: number;
  roomArea: number;
  quantity: number;
  bedType: string;
  thumbnailUrl?: string;
  description?: string;
  // Khớp với tên bên Backend C#
  roomTypeImages?: RoomImage[];
}

// 3. DTO: Hotel
interface HotelSimple {
  hotelID: number;
  name: string;
}

export default function RoomTypeList() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Đảm bảo hotelId luôn là số
  const hotelId = id ? parseInt(id, 10) : -1;

  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [hotels, setHotels] = useState<HotelSimple[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // --- STATE CHO MODAL XEM CHI TIẾT ---
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  // State: Index của ảnh đang được chọn xem (0 là ảnh đầu tiên)
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Cấu hình Domain Backend
  const BACKEND_DOMAIN = "http://localhost:5134";
  const API_ROOMS = `${BACKEND_DOMAIN}/api/RoomTypes`;
  const API_HOTELS = `${BACKEND_DOMAIN}/api/hotels`;

  // --- HÀM XỬ LÝ ẢNH ---
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "https://via.placeholder.com/500?text=No+Image";
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_DOMAIN}/Hotel_Image/${imagePath}`;
  };

  // --- HÀM TẠO LIST ẢNH GALLERY (Thumb + Images) ---
  const getGallery = (room: RoomType) => {
    const gallery = [];

    // 1. Ưu tiên Thumbnail làm ảnh đầu tiên
    if (room.thumbnailUrl) {
      gallery.push({
        id: "thumb",
        url: room.thumbnailUrl,
        caption: "Ảnh đại diện",
      });
    }

    // 2. Thêm các ảnh chi tiết phía sau
    if (room.roomTypeImages && Array.isArray(room.roomTypeImages)) {
      room.roomTypeImages.forEach((img) => {
        gallery.push({
          id: img.roomImageID,
          url: img.imageUrl,
          caption: img.caption || "Chi tiết",
        });
      });
    }

    return gallery;
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  // --- API CALLS ---
  const fetchHotels = async () => {
    try {
      const response = await axios.get(API_HOTELS);
      const data = response.data;
      // Xử lý các dạng trả về của API (Array hoặc Paged List)
      if (Array.isArray(data)) setHotels(data);
      else if (data?.items && Array.isArray(data.items)) setHotels(data.items);
      else setHotels([]);
    } catch (error) {
      console.error("Lỗi lấy danh sách khách sạn:", error);
    }
  };

  const fetchRooms = async () => {
    // Nếu chưa chọn khách sạn (hotelId = 0) -> Xóa list phòng, tắt loading
    if (!hotelId || hotelId === 0) {
      setRooms([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`${API_ROOMS}/hotel/${hotelId}`);
      const data = response.data;
      if (Array.isArray(data)) setRooms(data);
      else if (data?.items && Array.isArray(data.items)) setRooms(data.items);
      else setRooms([]);
    } catch (error) {
      console.error("Lỗi gọi API Room:", error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC HANDLE ---
  const handleHotelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const rawValue = event.target.value;
    console.log("Giá trị chọn:", rawValue); // Bật F12 xem log này in ra gì

    const val = parseInt(rawValue, 10);

    // Kiểm tra kỹ hơn: phải là số và lớn hơn 0
    if (!isNaN(val) && val !== -1) {
      navigate(`/roomTypes/hotel/${val}`);
    } else {
      // Nếu ID lỗi hoặc = 0, về trang gốc
      console.warn("ID không hợp lệ hoặc bằng 0, quay về mặc định");
      navigate(`/roomTypes`);
    }
  };

  const handleViewDetail = async (roomId: number) => {
    try {
      setDetailLoading(true);
      setIsModalOpen(true);
      setActiveImageIndex(0); // Reset về ảnh đầu tiên

      const response = await axios.get(`${API_ROOMS}/${roomId}`);
      setSelectedRoom(response.data);
    } catch (error) {
      console.error("Lỗi lấy chi tiết:", error);
      alert("Lỗi tải thông tin.");
      setIsModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  const handleDelete = async (roomId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa loại phòng này?")) return;
    try {
      await axios.delete(`${API_ROOMS}/${roomId}`);
      alert("Đã xóa thành công!");
      fetchRooms(); // Load lại lại danh sách hiện tại
    } catch (error) {
      console.error("Lỗi xóa:", error);
      alert("Xóa thất bại!");
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  // Biến tạm để lấy gallery hiện tại
  const currentGallery = selectedRoom ? getGallery(selectedRoom) : [];

  // --- STATE MỚI CHO MODAL XÓA ---
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    roomId: number | null;
  }>({
    isOpen: false,
    roomId: null,
  });

  // --- HÀM CHUYỂN TRANG SỬA ---
  const handleNavigateEdit = (roomId: number) => {
    navigate(`/roomTypes/edit/${roomId}`);
  };

  // --- LOGIC XÓA MỚI (MỞ MODAL) ---
  const openDeleteModal = (roomId: number) => {
    setDeleteModal({ isOpen: true, roomId: roomId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, roomId: null });
  };

  const confirmDelete = async () => {
    if (!deleteModal.roomId) return;
    try {
      await axios.delete(`${API_ROOMS}/${deleteModal.roomId}`);
      // Thông báo nhỏ hoặc chỉ cần load lại
      fetchRooms();
      closeDeleteModal();
    } catch (error) {
      console.error("Lỗi xóa:", error);
      alert("Xóa thất bại! Có thể phòng đang được đặt.");
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 mt-6 relative">
      {/* HEADER */}
      <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Quản lý Loại phòng
          </h3>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600">
              Đang xem khách sạn:
            </label>
            <select
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[250px] bg-white"
              value={hotelId || 0}
              onChange={handleHotelChange}
            >
              <option value={-1}>-- Chọn khách sạn --</option>
              {hotels.map((h: any) => {
                // Lấy ID dù backend trả về hotelID hay HotelID
                const realID = h.hotelID || h.HotelID;

                return (
                  <option key={realID} value={realID}>
                    {h.name || h.Name} {realID === 0 ? "(Lỗi ID=0)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <button
          onClick={() => {
            if (hotelId <= 0) {
              alert("Vui lòng chọn khách sạn trước khi thêm phòng!");
              return;
            }
            navigate(`/roomTypes/add/${hotelId}`);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition shadow-sm"
        >
          + Thêm Loại Phòng
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        {!hotelId || hotelId === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Vui lòng chọn khách sạn ở trên để xem danh sách phòng.
          </div>
        ) : loading ? (
          <div className="p-10 text-center text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Hình ảnh
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Tên Loại Phòng
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Giá Cơ Bản
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Thông tin
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Số lượng
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.map((room) => (
                <tr key={room.roomTypeID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={getImageUrl(room.thumbnailUrl)}
                      alt={room.name}
                      className="h-16 w-24 object-cover rounded-md border"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {room.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {room.bedType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-bold">
                    {formatCurrency(room.basePrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div>{room.roomArea} m²</div>
                    <div className="text-xs text-gray-500">
                      {room.maxAdults} NL, {room.maxChildren} TE
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        room.quantity > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {room.quantity} phòng
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      onClick={() => handleViewDetail(room.roomTypeID)}
                      className="text-teal-600 hover:text-teal-900 mr-4 font-semibold border border-teal-600 px-3 py-1 rounded hover:bg-teal-50 transition"
                    >
                      Xem & Ảnh
                    </button>
                    {/* NÚT SỬA ĐÃ UPDATE */}
                    <button
                      onClick={() => handleNavigateEdit(room.roomTypeID)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4 font-semibold border border-indigo-600 px-3 py-1 rounded hover:bg-indigo-50 transition"
                    >
                      Sửa
                    </button>

                    {/* NÚT XÓA GỌI MODAL */}
                    <button
                      onClick={() => openDeleteModal(room.roomTypeID)}
                      className="text-red-600 hover:text-red-900 font-semibold border border-red-600 px-3 py-1 rounded hover:bg-red-50 transition"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- MODAL XEM CHI TIẾT (ĐÃ UPDATE GALLERY) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                Chi tiết & Hình ảnh
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 overflow-y-auto">
              {detailLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              ) : selectedRoom ? (
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* --- CỘT TRÁI: GALLERY --- */}
                  <div className="w-full lg:w-1/2 flex flex-col">
                    {/* 1. Ảnh Lớn */}
                    <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-3 group">
                      <img
                        src={getImageUrl(currentGallery[activeImageIndex]?.url)}
                        alt="Main view"
                        className="w-full h-full object-contain" // object-contain để hiển thị trọn vẹn ảnh
                      />
                      {/* Caption đè lên ảnh */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 text-center opacity-0 group-hover:opacity-100 transition duration-300">
                        {currentGallery[activeImageIndex]?.caption}
                      </div>
                    </div>

                    {/* 2. Danh sách ảnh nhỏ (Thumbnails) */}
                    {currentGallery.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {currentGallery.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition cursor-pointer ${
                              activeImageIndex === index
                                ? "border-blue-600 shadow-md opacity-100"
                                : "border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={getImageUrl(img.url)}
                              alt="thumb"
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 italic">
                        Không có hình ảnh
                      </div>
                    )}
                  </div>

                  {/* --- CỘT PHẢI: THÔNG TIN --- */}
                  <div className="w-full lg:w-1/2 space-y-4">
                    <div>
                      <h4 className="text-3xl font-bold text-gray-900">
                        {selectedRoom.name}
                      </h4>
                      <div className="text-2xl text-blue-600 font-bold mt-1">
                        {formatCurrency(selectedRoom.basePrice)}{" "}
                        <span className="text-sm text-gray-500 font-normal">
                          / đêm
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 p-3 rounded border border-gray-100">
                        <span className="block text-gray-500 text-xs font-bold uppercase">
                          Diện tích
                        </span>
                        <span className="font-semibold text-gray-800">
                          {selectedRoom.roomArea} m²
                        </span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border border-gray-100">
                        <span className="block text-gray-500 text-xs font-bold uppercase">
                          Giường
                        </span>
                        <span className="font-semibold text-gray-800">
                          {selectedRoom.bedType}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border border-gray-100 col-span-2">
                        <span className="block text-gray-500 text-xs font-bold uppercase">
                          Sức chứa
                        </span>
                        <span className="font-semibold text-gray-800">
                          {selectedRoom.maxAdults} Người lớn,{" "}
                          {selectedRoom.maxChildren} Trẻ em
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-700">
                          Trạng thái:
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            selectedRoom.quantity > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {selectedRoom.quantity > 0
                            ? `Còn ${selectedRoom.quantity} phòng`
                            : "Hết phòng"}
                        </span>
                      </div>

                      <span className="font-bold text-gray-700 block mb-1">
                        Mô tả:
                      </span>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm text-gray-600 leading-relaxed max-h-40 overflow-y-auto">
                        {selectedRoom.description || "Chưa có mô tả chi tiết."}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-500">
                  Không tìm thấy dữ liệu.
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- MODAL XÁC NHẬN XÓA (CUSTOM MÀU ĐỎ) --- */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm animate-bounce-in">
            <div className="text-center">
              {/* Icon cảnh báo */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h3 className="text-lg leading-6 font-bold text-gray-900">
                Xóa loại phòng?
              </h3>
              <div className="mt-2">
                <p className="text-sm text-red-600 font-semibold bg-red-50 p-2 rounded border border-red-100">
                  Bạn có chắc muốn xóa? <br /> Hành động này không thể hoàn tác!
                </p>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 flex gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm"
                onClick={closeDeleteModal}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:text-sm"
                onClick={confirmDelete}
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
