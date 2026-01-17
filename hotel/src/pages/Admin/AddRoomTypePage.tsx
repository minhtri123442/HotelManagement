import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
// --- 1. IMPORT SWEETALERT2 ---
import Swal from "sweetalert2";

import {
  CloudArrowUpIcon,
  ArrowLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import AmenitySelector from "../../components/Admin/AmenitySelector";

export default function RoomTypeAdd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const BACKEND_DOMAIN = "http://localhost:5134";

  const defaultHotelId = id ? parseInt(id) : 0;
  const [loading, setLoading] = useState(false);

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

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [thumbPreview, setThumbPreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("HotelID", formData.hotelID);
    data.append("Name", formData.name);
    data.append("BasePrice", formData.basePrice);
    data.append("Description", formData.description);
    data.append("MaxAdults", formData.maxAdults);
    data.append("MaxChildren", formData.maxChildren);
    data.append("RoomArea", formData.roomArea);
    data.append("BedType", formData.bedType);
    data.append("Quantity", formData.quantity);

    selectedAmenities.forEach((id) => {
      data.append("AmenityIds", id);
    });
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

      // --- 2. THÔNG BÁO THÀNH CÔNG ---
      Swal.fire({
        icon: "success",
        title: "Thêm thành công!",
        text: "Đã thêm loại phòng mới vào hệ thống.",
        confirmButtonText: "Tuyệt vời",
      }).then(() => {
        // Quay về danh sách phòng của khách sạn đó
        navigate(`/admin/room-types/hotel/${formData.hotelID}`);
      });
    } catch (error) {
      console.error("Lỗi:", error);
      // --- 3. THÔNG BÁO LỖI ---
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: "Có lỗi xảy ra khi tải lên. Vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-gray-200 relative font-sans">
      <div className="border-b pb-4 mb-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-blue-600 transition"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Thêm Loại Phòng</h2>
          <p className="text-sm text-gray-500">
            Nhập thông tin và tải ảnh từ máy tính
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
        {/* --- CHỌN TIỆN ÍCH PHÒNG --- */}
        <div className="mt-6">
          <AmenitySelector
            type="Room" // Chỉ hiện các tiện ích dành cho phòng
            selectedIds={selectedAmenities}
            onChange={setSelectedAmenities}
          />
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
                  <XMarkIcon className="w-3 h-3" />
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
    </div>
  );
}
