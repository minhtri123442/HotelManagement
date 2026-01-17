import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
// --- 1. IMPORT SWEETALERT2 ---
import Swal from "sweetalert2";

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

  const hotelId = id ? parseInt(id, 10) : -1;

  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [hotels, setHotels] = useState<HotelSimple[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const BACKEND_DOMAIN = "http://localhost:5134";
  const API_ROOMS = `${BACKEND_DOMAIN}/api/RoomTypes`;
  const API_HOTELS = `${BACKEND_DOMAIN}/api/hotels`;

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "https://via.placeholder.com/500?text=No+Image";
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_DOMAIN}/Hotel_Image/${imagePath}`;
  };

  const getGallery = (room: RoomType) => {
    const gallery = [];
    if (room.thumbnailUrl) {
      gallery.push({
        id: "thumb",
        url: room.thumbnailUrl,
        caption: "Ảnh đại diện",
      });
    }
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

  const fetchHotels = async () => {
    try {
      const response = await axios.get(API_HOTELS);
      const data = response.data;
      if (Array.isArray(data)) setHotels(data);
      else if (data?.items && Array.isArray(data.items)) setHotels(data.items);
      else setHotels([]);
    } catch (error) {
      console.error("Lỗi lấy danh sách khách sạn:", error);
    }
  };

  const fetchRooms = async () => {
    if (hotelId === -1 || isNaN(hotelId)) {
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

  const handleHotelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const rawValue = event.target.value;
    const val = parseInt(rawValue, 10);
    if (!isNaN(val)) {
      navigate(`/admin/room-types/hotel/${val}`);
    } else {
      navigate(`/admin/room-types`);
    }
  };

  const handleViewDetail = async (roomId: number) => {
    try {
      setDetailLoading(true);
      setIsModalOpen(true);
      setActiveImageIndex(0);
      const response = await axios.get(`${API_ROOMS}/${roomId}`);
      setSelectedRoom(response.data);
    } catch (error) {
      console.error("Lỗi lấy chi tiết:", error);
      Swal.fire("Lỗi", "Không tải được thông tin chi tiết.", "error");
      setIsModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  // --- 2. SỬA HÀM XÓA DÙNG SWEETALERT ---
  const handleDelete = async (roomId: number) => {
    // Gọi SweetAlert Confirm
    const result = await Swal.fire({
      title: "Bạn chắc chắn chứ?",
      text: "Loại phòng này sẽ bị xóa vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // Đỏ
      cancelButtonColor: "#3085d6", // Xanh
      confirmButtonText: "Vâng, xóa nó!",
      cancelButtonText: "Hủy bỏ",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_ROOMS}/${roomId}`);
        // Thành công
        Swal.fire("Đã xóa!", "Loại phòng đã bị xóa.", "success");
        fetchRooms();
      } catch (error) {
        console.error("Lỗi xóa:", error);
        Swal.fire(
          "Thất bại!",
          "Không thể xóa phòng này (Có thể đang có đơn đặt).",
          "error"
        );
      }
    }
  };

  const handleNavigateEdit = (roomId: number) => {
    navigate(`/admin/room-types/edit/${roomId}`);
  };

  // --- HÀM THÊM MỚI CÓ VALIDATE ALERT ---
  const handleAddClick = () => {
    if (!hotelId || hotelId <= 0) {
      Swal.fire({
        icon: "info",
        title: "Chưa chọn khách sạn",
        text: "Vui lòng chọn khách sạn ở danh sách trên trước khi thêm phòng!",
      });
      return;
    }
    navigate(`/admin/room-types/add/${hotelId}`);
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  const currentGallery = selectedRoom ? getGallery(selectedRoom) : [];

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 mt-6 relative font-sans">
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
              value={
                hotelId !== null && hotelId !== undefined && !isNaN(hotelId)
                  ? hotelId
                  : -1
              }
              onChange={handleHotelChange}
            >
              <option value={-1}>-- Chọn khách sạn --</option>
              {hotels.map((h: any, index) => {
                const realID =
                  h.hotelID ?? h.HotelID ?? h.id ?? h.Id ?? h.hotelId;
                const realName = h.name ?? h.Name;
                if (realID === undefined || realID === null) return null;
                return (
                  <option key={realID} value={realID}>
                    {realName} {realID === 0 ? "(ID: 0)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <button
          onClick={handleAddClick}
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
                    <button
                      onClick={() => handleNavigateEdit(room.roomTypeID)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4 font-semibold border border-indigo-600 px-3 py-1 rounded hover:bg-indigo-50 transition"
                    >
                      Sửa
                    </button>
                    {/* NÚT XÓA GỌI HÀM SWAL */}
                    <button
                      onClick={() => handleDelete(room.roomTypeID)}
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

      {/* --- MODAL XEM CHI TIẾT (Giữ nguyên phần này) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
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
            <div className="p-6 overflow-y-auto">
              {detailLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              ) : selectedRoom ? (
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="w-full lg:w-1/2 flex flex-col">
                    <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-3 group">
                      <img
                        src={getImageUrl(currentGallery[activeImageIndex]?.url)}
                        alt="Main view"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 text-center opacity-0 group-hover:opacity-100 transition duration-300">
                        {currentGallery[activeImageIndex]?.caption}
                      </div>
                    </div>
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

      {/* --- ĐÃ XÓA BỎ MODAL XÓA THỦ CÔNG (VÌ ĐÃ DÙNG SWEETALERT) --- */}
    </div>
  );
}
