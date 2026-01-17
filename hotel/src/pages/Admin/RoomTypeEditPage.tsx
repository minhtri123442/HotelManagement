import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
// --- 1. IMPORT SWEETALERT2 ---
import Swal from "sweetalert2";

import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import AmenitySelector from "../../components/Admin/AmenitySelector";

export default function RoomTypeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const BACKEND_DOMAIN = "http://localhost:5134";
  const API_ROOMS = `${BACKEND_DOMAIN}/api/RoomTypes`;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const [newThumbnailFile, setNewThumbnailFile] = useState(null);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);
  const [thumbPreview, setThumbPreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${BACKEND_DOMAIN}/Hotel_Image/${path}`;
  };

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
        console.log("Dữ liệu phòng trả về:", data); // Kiểm tra xem có mảng nào tên là amenityIds không

        // Thử cả hai kiểu viết hoa/thường
        const ids = data.amenityIds || data.AmenityIds || [];
        setSelectedAmenities(ids);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        // --- 2. ALERT KHI LOAD LỖI ---
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không tìm thấy thông tin loại phòng!",
        }).then(() => {
          navigate(-1);
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, navigate, API_ROOMS]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewThumbnailFile(file);
      setThumbPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setNewGalleryFiles((prev) => [...prev, ...filesArr]);
      const newPreviews = filesArr.map((f) => URL.createObjectURL(f));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeNewGalleryImage = (index) => {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    data.append("RoomTypeID", formData.roomTypeID);
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

      // --- 3. ALERT THÀNH CÔNG ---
      Swal.fire({
        icon: "success",
        title: "Cập nhật thành công!",
        text: "Thông tin loại phòng đã được lưu lại.",
        confirmButtonText: "OK",
      }).then(() => {
        navigate(`/admin/room-types/hotel/${formData.hotelID}`);
      });
    } catch (error) {
      console.error("Lỗi chi tiết:", error);
      // --- 4. ALERT LỖI ---
      Swal.fire({
        icon: "error",
        title: "Cập nhật thất bại",
        text: "Vui lòng kiểm tra lại thông tin.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return <div className="p-10 text-center text-gray-500">Đang tải...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-gray-200 relative font-sans">
      <div className="border-b pb-4 mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-blue-600"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          Chỉnh sửa Loại Phòng
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- TEXT INPUTS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-bold mb-1">
              Tên loại phòng *
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full border p-2 rounded"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-bold mb-1">Giá cơ bản *</label>
            <input
              type="number"
              name="basePrice"
              required
              className="w-full border p-2 rounded"
              value={formData.basePrice}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Người lớn</label>
            <input
              type="number"
              name="maxAdults"
              className="w-full border p-2 rounded"
              value={formData.maxAdults}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Trẻ em</label>
            <input
              type="number"
              name="maxChildren"
              className="w-full border p-2 rounded"
              value={formData.maxChildren}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Diện tích</label>
            <input
              type="number"
              name="roomArea"
              className="w-full border p-2 rounded"
              value={formData.roomArea}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Số lượng</label>
            <input
              type="number"
              name="quantity"
              className="w-full border p-2 rounded"
              value={formData.quantity}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">Loại giường</label>
            <input
              type="text"
              name="bedType"
              className="w-full border p-2 rounded"
              value={formData.bedType}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">Mô tả</label>
            <textarea
              name="description"
              rows={3}
              className="w-full border p-2 rounded"
              value={formData.description}
              onChange={handleInputChange}
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
            Ảnh đại diện
          </label>
          <div className="flex items-center gap-6">
            <div className="w-24 h-20 border rounded bg-white overflow-hidden flex items-center justify-center">
              {thumbPreview ? (
                <img
                  src={thumbPreview}
                  alt="New"
                  className="w-full h-full object-cover"
                />
              ) : formData.existingThumbnail ? (
                <img
                  src={getImageUrl(formData.existingThumbnail)}
                  alt="Old"
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <PhotoIcon className="w-8 h-8 text-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbChange}
                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-100 file:text-blue-700 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                Chọn ảnh mới để thay thế ảnh cũ.
              </p>
            </div>
          </div>
        </div>

        {/* --- UPLOAD GALLERY --- */}
        <div className="border border-teal-100 bg-teal-50 p-4 rounded-lg">
          <label className="block font-bold text-gray-800 mb-2">
            Bộ sưu tập ảnh
          </label>

          {/* Ảnh cũ */}
          {existingGallery.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {existingGallery.map((img) => (
                <img
                  key={img.roomImageID}
                  src={getImageUrl(img.imageUrl)}
                  className="h-16 rounded border grayscale opacity-80"
                  alt="Old Gallery"
                />
              ))}
            </div>
          )}

          {/* Input ảnh mới */}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleGalleryChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-teal-100 file:text-teal-700 cursor-pointer"
          />

          {/* Preview ảnh mới */}
          {galleryPreviews.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {galleryPreviews.map((src, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={src}
                    className="h-16 rounded border border-green-500"
                    alt="New Preview"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewGalleryImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    X
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
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold flex items-center gap-2"
          >
            {submitting ? (
              "Đang lưu..."
            ) : (
              <>
                <CloudArrowUpIcon className="w-5 h-5" /> Cập nhật
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
