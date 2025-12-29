import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { CloudArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function RoomTypeAdd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const BACKEND_DOMAIN = "http://localhost:5134";

  // HotelID mặc định
  const defaultHotelId = id ? parseInt(id) : 0;

  // State Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. State TEXT
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

  // 2. State FILE (Bỏ cú pháp <File | null>)
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  // 3. State PREVIEW
  const [thumbPreview, setThumbPreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  // --- HANDLE FILES ---
  const handleThumbChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setGalleryFiles((prev) => [...prev, ...filesArr]);
      const newPreviews = filesArr.map((f) => URL.createObjectURL(f));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate(`/roomTypes/hotel/${formData.hotelID}`);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    // Chuyển đổi số sang string để tránh lỗi
    data.append("HotelID", formData.hotelID);
    data.append("Name", formData.name);
    data.append("BasePrice", formData.basePrice);
    data.append("Description", formData.description);
    data.append("MaxAdults", formData.maxAdults);
    data.append("MaxChildren", formData.maxChildren);
    data.append("RoomArea", formData.roomArea);
    data.append("BedType", formData.bedType);
    data.append("Quantity", formData.quantity);

    // Tên Key phải khớp với Backend RoomTypeCreateDto: "ThumbnailImage"
    if (thumbnailFile) {
      data.append("ThumbnailImage", thumbnailFile);
    }

    // Tên Key phải khớp với Backend RoomTypeCreateDto: "GalleryImages"
    galleryFiles.forEach((file) => {
      data.append("GalleryImages", file);
    });

    try {
      await axios.post(`${BACKEND_DOMAIN}/api/RoomTypes`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Có lỗi xảy ra khi upload! Kiểm tra Console để biết chi tiết.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-gray-200 relative">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Thêm Loại Phòng</h2>
        <p className="text-sm text-gray-500">
          Nhập thông tin và tải ảnh từ máy tính
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- FORM FIELDS GIỮ NGUYÊN --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Tên loại phòng *
            </label>
            <input
              type="text"
              required
              className="w-full border p-2 rounded"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Giá cơ bản *
            </label>
            <input
              type="number"
              required
              min={0}
              className="w-full border p-2 rounded"
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
              <label className="block text-sm font-medium">Người lớn</label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={formData.maxAdults}
                onChange={(e) =>
                  setFormData({ ...formData, maxAdults: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Trẻ em</label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={formData.maxChildren}
                onChange={(e) =>
                  setFormData({ ...formData, maxChildren: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Diện tích (m²)</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={formData.roomArea}
              onChange={(e) =>
                setFormData({ ...formData, roomArea: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Số lượng</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">Loại giường</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.bedType}
              onChange={(e) =>
                setFormData({ ...formData, bedType: e.target.value })
              }
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">Mô tả</label>
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

        {/* --- UPLOAD THUMBNAIL --- */}
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
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
              />
            </div>
            {thumbPreview && (
              <img
                src={thumbPreview}
                alt="Thumb"
                className="w-32 h-24 border rounded object-cover"
              />
            )}
          </div>
        </div>

        {/* --- UPLOAD GALLERY --- */}
        <div className="border border-teal-100 bg-teal-50 p-4 rounded-lg">
          <label className="block font-bold text-gray-800 mb-2">
            Bộ sưu tập ảnh ({galleryFiles.length})
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleGalleryChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200 cursor-pointer mb-3"
          />

          <div className="flex flex-wrap gap-2">
            {galleryPreviews.map((src, idx) => (
              <div key={idx} className="relative group w-20 h-20">
                <img
                  src={src}
                  className="w-full h-full object-cover rounded border"
                  alt="preview"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  X
                </button>
              </div>
            ))}
          </div>
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
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold flex items-center gap-2"
          >
            {loading ? (
              "Đang lưu..."
            ) : (
              <>
                <CloudArrowUpIcon className="w-5 h-5" /> Lưu & Upload
              </>
            )}
          </button>
        </div>
      </form>

      {/* MODAL SUCCESS GIỮ NGUYÊN LOGIC */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-sm text-center">
            <h3 className="text-2xl font-bold text-green-600 mb-2">
              Thành công!
            </h3>
            <p className="text-gray-500 mb-6">Đã thêm loại phòng mới.</p>
            <button
              onClick={handleCloseSuccessModal}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-bold"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
