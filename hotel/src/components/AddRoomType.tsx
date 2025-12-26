import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function RoomTypeAdd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const BACKEND_DOMAIN = "http://localhost:5134";

  // HotelID mặc định
  const defaultHotelId = id ? parseInt(id) : 0;

  // --- STATE MỚI: ĐỂ HIỆN MODAL THÀNH CÔNG ---
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 1. State cho các trường TEXT
  const [formData, setFormData] = useState({
    hotelID: defaultHotelId,
    name: "",
    basePrice: 0,
    description: "",
    maxAdults: 2,
    maxChildren: 1,
    roomArea: 0,
    bedType: "",
    quantity: 1,
  });

  // 2. State cho FILE
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  // 3. State cho PREVIEW
  const [thumbPreview, setThumbPreview] = useState<string>("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // --- XỬ LÝ CHỌN ẢNH THUMBNAIL ---
  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbPreview(URL.createObjectURL(file));
    }
  };

  // --- XỬ LÝ CHỌN NHIỀU ẢNH GALLERY ---
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setGalleryFiles((prev) => [...prev, ...filesArr]);
      const newPreviews = filesArr.map((f) => URL.createObjectURL(f));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // --- XÓA ẢNH TRONG GALLERY ---
  const removeGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // --- HÀM ĐÓNG MODAL VÀ CHUYỂN TRANG ---
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate(`/roomTypes/hotel/${formData.hotelID}`);
  };

  // --- SUBMIT FORM ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("HotelID", formData.hotelID.toString());
    data.append("Name", formData.name);
    data.append("BasePrice", formData.basePrice.toString());
    data.append("Description", formData.description);
    data.append("MaxAdults", formData.maxAdults.toString());
    data.append("MaxChildren", formData.maxChildren.toString());
    data.append("RoomArea", formData.roomArea.toString());
    data.append("BedType", formData.bedType);
    data.append("Quantity", formData.quantity.toString());

    if (thumbnailFile) {
      data.append("ThumbnailImage", thumbnailFile);
    }

    galleryFiles.forEach((file) => {
      data.append("GalleryImages", file);
    });

    try {
      await axios.post(`${BACKEND_DOMAIN}/api/RoomTypes`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // THAY ĐỔI: Hiện Modal thay vì Alert
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Có lỗi xảy ra khi upload! Vui lòng kiểm tra lại server.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-gray-200 relative">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Thêm Loại Phòng (Admin Upload)
        </h2>
        <p className="text-sm text-gray-500">
          Nhập thông tin và tải ảnh từ máy tính
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- PHẦN 1: THÔNG TIN CƠ BẢN --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="hidden">
            <input type="number" value={formData.hotelID} readOnly />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Tên loại phòng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Giá cơ bản (VND) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min={0}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.basePrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  basePrice: parseFloat(e.target.value),
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Người lớn
              </label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={formData.maxAdults}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxAdults: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trẻ em
              </label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={formData.maxChildren}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxChildren: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diện tích (m²)
            </label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={formData.roomArea}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  roomArea: parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng
            </label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseInt(e.target.value) })
              }
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại giường
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              placeholder="Vd: 1 King Bed"
              value={formData.bedType}
              onChange={(e) =>
                setFormData({ ...formData, bedType: e.target.value })
              }
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              rows={3}
              className="w-full border p-2 rounded"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
        </div>

        {/* --- PHẦN 2: UPLOAD THUMBNAIL --- */}
        <div className="border border-blue-100 bg-blue-50 p-4 rounded-lg">
          <label className="block font-bold text-gray-800 mb-2">
            Ảnh đại diện (Thumbnail)
          </label>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                Chọn 1 ảnh duy nhất để làm bìa.
              </p>
            </div>
            {thumbPreview && (
              <div className="w-32 h-24 border rounded bg-white shadow-sm overflow-hidden flex-shrink-0">
                <img
                  src={thumbPreview}
                  alt="Thumb"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* --- PHẦN 3: UPLOAD GALLERY --- */}
        <div className="border border-teal-100 bg-teal-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <label className="block font-bold text-gray-800">
              Thêm bộ sưu tập ảnh chi tiết
            </label>
            <span
              className={`text-sm font-bold px-3 py-1 rounded-full border ${
                galleryFiles.length > 0
                  ? "bg-teal-100 text-teal-800 border-teal-300"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              }`}
            >
              {galleryFiles.length === 0
                ? "Chưa chọn tệp nào"
                : `${galleryFiles.length} tệp đã chọn`}
            </span>
          </div>

          <div className="mb-4">
            <input
              id="gallery-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleGalleryChange}
              className="hidden"
            />
            <label
              htmlFor="gallery-upload"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-teal-300 rounded-md text-teal-700 font-medium hover:bg-teal-50 shadow-sm transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Chọn ảnh từ máy
            </label>
          </div>

          {galleryPreviews.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {galleryPreviews.map((src, index) => (
                <div
                  key={index}
                  className="relative group w-full h-24 border rounded bg-white shadow-sm"
                >
                  <img
                    src={src}
                    alt={`Gallery ${index}`}
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm opacity-90 hover:bg-red-600 transition"
                    title="Xóa ảnh này"
                  >
                    ✕
                  </button>
                  <span className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-[10px] px-1.5 rounded">
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border-2 border-dashed border-teal-200 rounded-lg bg-white">
              <p className="text-gray-400 text-sm italic">Danh sách trống.</p>
            </div>
          )}
        </div>

        {/* --- BUTTONS --- */}
        <div className="flex justify-end gap-4 border-t pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 font-medium transition"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold shadow-md transition"
          >
            Lưu & Upload
          </button>
        </div>
      </form>

      {/* --- MODAL THÔNG BÁO THÀNH CÔNG (MỚI) --- */}
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
              Thêm mới thành công!
            </h3>
            <div className="mt-2 mb-6">
              <p className="text-sm text-gray-500">
                Loại phòng mới đã được thêm vào hệ thống và sẵn sàng hoạt động.
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
