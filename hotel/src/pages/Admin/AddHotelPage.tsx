import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// --- 1. IMPORT SWEETALERT2 ---
import Swal from "sweetalert2";

import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// --- IMPORT COMPONENT SELECTOR ---
import AmenitySelector from "../../components/Admin/AmenitySelector";

const API_BASE = "http://localhost:5134";

export default function HotelAdd() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  // --- 2. THÊM STATE LƯU ID TIỆN ÍCH ---
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    address: "",
    locationId: "",
    description: "",
    starRating: 3,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    status: "Active",
    mapUrl: "",
    mapLatitude: "",
    mapLongitude: "",
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/locations`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Dữ liệu địa điểm nhận được:", data); // Dòng này cực quan trọng để check

        // Nếu Backend trả về mảng trực tiếp [{}, {}]
        if (Array.isArray(data)) {
          setLocations(data);
        } else if (data.items && Array.isArray(data.items)) {
          setLocations(data.items);
        }
      })
      .catch((err) => console.error("Không tải được location:", err));
  }, []);

  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "name") {
        return { ...prev, name: value, slug: generateSlug(value) };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleMapUrlChange = (e) => {
    let value = e.target.value;
    if (value.includes("<iframe") && value.includes('src="')) {
      const match = value.match(/src="([^"]*)"/);
      if (match && match[1]) {
        value = match[1];
      }
    }
    setFormData((prev) => ({ ...prev, mapUrl: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setGalleryFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // --- 2. SỬA HÀM SUBMIT VỚI SWEETALERT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.locationId) {
      // Thông báo Validate
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin",
        text: "Vui lòng chọn địa điểm cho khách sạn!",
      });
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      // ... Append data giữ nguyên ...
      data.append("name", formData.name);
      data.append("slug", formData.slug);
      data.append("address", formData.address);
      data.append("locationId", formData.locationId);
      data.append("description", formData.description);
      data.append("starRating", formData.starRating);
      data.append("checkInTime", formData.checkInTime);
      data.append("checkOutTime", formData.checkOutTime);
      data.append("status", formData.status);
      data.append("mapUrl", formData.mapUrl);
      if (formData.mapLatitude)
        data.append("mapLatitude", formData.mapLatitude);
      if (formData.mapLongitude)
        data.append("mapLongitude", formData.mapLongitude);

      if (selectedImage) {
        data.append("ImageFile", selectedImage);
      }
      galleryFiles.forEach((file) => {
        data.append("GalleryFiles", file);
      });

      // --- 3. APPEND DANH SÁCH TIỆN ÍCH VÀO FORMDATA ---
      // Backend sẽ nhận dưới dạng List<int> AmenityIds
      selectedAmenities.forEach((id) => {
        data.append("AmenityIds", id);
      });

      const res = await fetch(`${API_BASE}/api/hotels`, {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        // Thông báo thành công và chuyển trang sau khi bấm OK
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Đã thêm khách sạn mới vào hệ thống.",
          confirmButtonText: "Tuyệt vời",
        }).then(() => {
          navigate("/admin/hotels");
        });
      } else {
        const errorText = await res.text();
        Swal.fire({
          icon: "error",
          title: "Thất bại",
          text: "Lỗi server: " + errorText,
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Lỗi kết nối",
        text: "Không thể kết nối đến máy chủ!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Thêm Mới Khách Sạn
          </h1>
          <Link
            to="/admin/hotels"
            className="text-gray-500 hover:text-blue-600 transition flex items-center gap-1"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Quay lại danh sách
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow border border-gray-200 p-6 sm:p-8"
        >
          {/* ... Phần Form Giữ Nguyên ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên khách sạn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm p-2 border"
                  placeholder="Ví dụ: Khách sạn Mường Thanh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  readOnly
                  value={formData.slug}
                  className="w-full bg-gray-100 border-gray-300 rounded-lg shadow-sm p-2 border text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa điểm <span className="text-red-500">*</span>
                </label>
                <select
                  name="locationId"
                  required
                  value={formData.locationId}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm p-2 border"
                >
                  <option value="">-- Chọn Tỉnh/Thành phố --</option>
                  {locations.map((loc) => (
                    <option
                      key={loc.locationId || loc.locationID}
                      value={loc.locationId || loc.locationID}
                    >
                      {loc.locationName || loc.locationName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ chi tiết
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm p-2 border"
                  placeholder="VD: 123 Đường ABC..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hạng sao
                  </label>
                  <select
                    name="starRating"
                    value={formData.starRating}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2 border"
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <option key={s} value={s}>
                        {s} Sao
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2 border"
                  >
                    <option value="Active">Hoạt động</option>
                    <option value="Inactive">Tạm ẩn</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in
                  </label>
                  <input
                    type="time"
                    name="checkInTime"
                    value={formData.checkInTime}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out
                  </label>
                  <input
                    type="time"
                    name="checkOutTime"
                    value={formData.checkOutTime}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2 border"
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3">
                  Cấu hình Bản đồ
                </h3>
                <div className="mb-3">
                  <input
                    type="text"
                    name="mapUrl"
                    value={formData.mapUrl}
                    onChange={handleMapUrlChange}
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2 border text-sm"
                    placeholder="Link Embed Map..."
                  />
                  {formData.mapUrl && (
                    <div className="mt-2 w-full h-32 bg-gray-100 rounded overflow-hidden border">
                      <iframe
                        src={formData.mapUrl}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        title="Preview Map"
                      ></iframe>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Nhập mô tả..."
            />
          </div>

          {/* --- 4. CHÈN COMPONENT SELECTOR VÀO (Ví dụ đặt dưới phần Mô tả) --- */}
          <div className="mt-6">
            <AmenitySelector
              type="Hotel" // Chỉ hiện tiện ích loại Hotel
              selectedIds={selectedAmenities}
              onChange={setSelectedAmenities}
            />
          </div>

          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Hình ảnh</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-blue-800 mb-2">
                  1. Ảnh đại diện (Main Thumbnail)
                </label>
                <div className="flex items-center gap-4 border p-4 rounded-lg bg-blue-50 border-blue-100">
                  <div className="w-24 h-24 border border-gray-300 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <PhotoIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-teal-800 mb-2">
                  2. Bộ sưu tập ảnh (Chọn nhiều)
                </label>
                <div className="border p-4 rounded-lg bg-teal-50 border-teal-100">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer mb-3"
                  />

                  {galleryPreviews.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {galleryPreviews.map((src, idx) => (
                        <div key={idx} className="relative group w-16 h-16">
                          <img
                            src={src}
                            alt="Gallery"
                            className="w-full h-full object-cover rounded border border-teal-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      Chưa có ảnh phụ nào được chọn.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/hotels")}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {loading ? (
                "Đang tải lên..."
              ) : (
                <>
                  <CloudArrowUpIcon className="w-5 h-5" />
                  Lưu lại
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
