import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

interface RoomImageDto {
  roomImageID: number;
  imageUrl: string;
}

export default function RoomTypeEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const BACKEND_DOMAIN = "http://localhost:5134";
  const API_ROOMS = `${BACKEND_DOMAIN}/api/RoomTypes`;

  const [loading, setLoading] = useState(true);

  // --- STATE MỚI: ĐỂ HIỆN MODAL THÀNH CÔNG ---
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 1. Dữ liệu TEXT
  const [formData, setFormData] = useState({
    roomTypeID: 0,
    hotelID: 0,
    name: "",
    basePrice: 0,
    description: "",
    maxAdults: 2,
    maxChildren: 1,
    roomArea: 0,
    bedType: "",
    quantity: 1,
    existingThumbnail: "",
  });

  const [newThumbnailFile, setNewThumbnailFile] = useState<File | null>(null);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [existingGallery, setExistingGallery] = useState<RoomImageDto[]>([]);

  // Preview ảnh
  const [thumbPreview, setThumbPreview] = useState<string>("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // Helper lấy ảnh
  const getImageUrl = (path?: string) => {
    if (!path) return "https://via.placeholder.com/150";
    if (path.startsWith("http")) return path;
    return `${BACKEND_DOMAIN}/Hotel_Image/${path}`;
  };

  // --- LOAD DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_ROOMS}/${id}`);
        const data = res.data;

        setFormData({
          roomTypeID: data.roomTypeID,
          hotelID: data.hotelID,
          name: data.name || "",
          basePrice: data.basePrice ?? 0,
          description: data.description || "",
          maxAdults: data.maxAdults ?? 2,
          maxChildren: data.maxChildren ?? 1,
          roomArea: data.roomArea ?? 0,
          bedType: data.bedType || "",
          quantity: data.quantity ?? 1,
          existingThumbnail: data.thumbnailUrl,
        });

        if (data.roomTypeImages) {
          setExistingGallery(data.roomTypeImages);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        alert("Không tìm thấy loại phòng!");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, navigate, API_ROOMS]);

  // --- HANDLE INPUT ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- HANDLE FILES ---
  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewThumbnailFile(file);
      setThumbPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setNewGalleryFiles((prev) => [...prev, ...filesArr]);
      const newPreviews = filesArr.map((f) => URL.createObjectURL(f));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeNewGalleryImage = (index: number) => {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // --- HÀM ĐÓNG MODAL THÀNH CÔNG VÀ CHUYỂN TRANG ---
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate(`/roomTypes/hotel/${formData.hotelID}`);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("RoomTypeID", formData.roomTypeID.toString());
    data.append("HotelID", formData.hotelID.toString());
    data.append("Name", formData.name);
    data.append("BasePrice", formData.basePrice.toString());
    data.append("Description", formData.description);
    data.append("MaxAdults", formData.maxAdults.toString());
    data.append("MaxChildren", formData.maxChildren.toString());
    data.append("RoomArea", formData.roomArea.toString());
    data.append("BedType", formData.bedType);
    data.append("Quantity", formData.quantity.toString());

    if (newThumbnailFile) {
      data.append("ThumbnailImage", newThumbnailFile);
    }
    newGalleryFiles.forEach((file) => {
      data.append("GalleryImages", file);
    });

    try {
      await axios.put(`${API_ROOMS}/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // THAY ĐỔI: Không alert nữa, mà hiện Modal đẹp
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Lỗi chi tiết:", error);
      if (error.response) {
        if (error.response.status === 405) {
          alert("Lỗi 405: Backend chưa có hàm [HttpPut].");
        } else if (error.response.status === 400) {
          alert(`Lỗi dữ liệu: ${JSON.stringify(error.response.data)}`);
        } else {
          alert(`Lỗi Server (${error.response.status})`);
        }
      } else {
        alert("Không thể kết nối tới Server!");
      }
    }
  };

  if (loading)
    return <div className="p-10 text-center text-gray-500">Đang tải...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-gray-200 relative">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Chỉnh sửa Loại Phòng
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- FORM FIELDS (Giữ nguyên) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Tên loại phòng *
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full border p-2 rounded focus:ring-blue-500 outline-none"
              value={formData.name || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Giá cơ bản *
            </label>
            <input
              type="number"
              name="basePrice"
              required
              className="w-full border p-2 rounded focus:ring-blue-500 outline-none"
              value={formData.basePrice || 0}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Người lớn
              </label>
              <input
                type="number"
                name="maxAdults"
                className="w-full border p-2 rounded"
                value={formData.maxAdults || 0}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trẻ em
              </label>
              <input
                type="number"
                name="maxChildren"
                className="w-full border p-2 rounded"
                value={formData.maxChildren || 0}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diện tích (m²)
            </label>
            <input
              type="number"
              name="roomArea"
              className="w-full border p-2 rounded"
              value={formData.roomArea || 0}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng
            </label>
            <input
              type="number"
              name="quantity"
              className="w-full border p-2 rounded"
              value={formData.quantity || 0}
              onChange={handleInputChange}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại giường
            </label>
            <input
              type="text"
              name="bedType"
              className="w-full border p-2 rounded"
              value={formData.bedType || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full border p-2 rounded"
              value={formData.description || ""}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* --- THUMBNAIL --- */}
        <div className="border border-blue-100 bg-blue-50 p-4 rounded-lg">
          <label className="block font-bold text-gray-800 mb-2">
            Ảnh đại diện (Thumbnail)
          </label>
          <div className="flex items-center gap-6">
            <div className="w-24 h-20 border rounded bg-white overflow-hidden">
              <img
                src={getImageUrl(formData.existingThumbnail)}
                alt="Old"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbChange}
                className="text-sm"
              />
              {thumbPreview && (
                <img
                  src={thumbPreview}
                  alt="New"
                  className="h-20 mt-2 rounded border"
                />
              )}
            </div>
          </div>
        </div>

        {/* --- GALLERY --- */}
        <div className="border border-teal-100 bg-teal-50 p-4 rounded-lg">
          <label className="block font-bold text-gray-800 mb-2">
            Bộ sưu tập ảnh chi tiết
          </label>
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {existingGallery.map((img) => (
              <img
                key={img.roomImageID}
                src={getImageUrl(img.imageUrl)}
                className="h-16 rounded border"
                alt="Old Gallery"
              />
            ))}
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleGalleryChange}
            className="block w-full text-sm"
          />
          {galleryPreviews.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {galleryPreviews.map((src, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={src}
                    className="h-16 rounded border border-green-500"
                    alt="New Preview"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewGalleryImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- BUTTONS --- */}
        <div className="flex justify-end gap-4 border-t pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border rounded hover:bg-gray-100"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
          >
            Cập nhật
          </button>
        </div>
      </form>

      {/* --- MODAL THÔNG BÁO THÀNH CÔNG (ĐẸP NHƯ MODAL XÓA) --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm animate-bounce-in text-center transform scale-100">
            {/* Icon Thành Công Màu Xanh */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-2">
              Thành công!
            </h3>
            <div className="mt-2 mb-6">
              <p className="text-sm text-gray-500">
                Thông tin loại phòng đã được cập nhật thành công vào hệ thống.
              </p>
            </div>

            <div className="mt-5">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-md px-4 py-3 bg-green-600 text-base font-bold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm transition-colors"
                onClick={handleCloseSuccessModal}
              >
                Quay lại danh sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
