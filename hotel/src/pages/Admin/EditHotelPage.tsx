import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
// --- 1. IMPORT SWEETALERT2 ---
import Swal from "sweetalert2";

import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import AmenitySelector from "../../components/Admin/AmenitySelector";

const API_BASE = "http://localhost:5134";

export default function HotelEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedMainImage, setSelectedMainImage] = useState(null);
  const [mainPreview, setMainPreview] = useState(null);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    address: "",
    locationID: "",
    description: "",
    starRating: 3,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    status: "Active",
    mapUrl: "",
    mapLatitude: "",
    mapLongitude: "",
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/150";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE}/Hotel_Image/${imagePath.replace(/^\/+/, "")}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resLoc = await fetch(`${API_BASE}/api/locations`);
        const dataLoc = await resLoc.json();
        setLocations(Array.isArray(dataLoc) ? dataLoc : dataLoc.items || []);

        const resHotel = await fetch(`${API_BASE}/api/hotels/${id}`);
        if (!resHotel.ok) throw new Error("Không tìm thấy khách sạn");
        const data = await resHotel.json();

        setFormData({
          name: data.name,
          slug: data.slug,
          address: data.address,
          locationID: data.locationID,
          description: data.description || "",
          starRating: data.starRating,
          checkInTime: data.checkInTime || "14:00",
          checkOutTime: data.checkOutTime || "12:00",
          status: data.status,
          mapUrl: data.mapUrl || "",
          mapLatitude: data.mapLatitude || "",
          mapLongitude: data.mapLongitude || "",
        });

        if (data.hotelAmenities && Array.isArray(data.hotelAmenities)) {
          const ids = data.hotelAmenities.map((ha) => ha.amenityId); // Lấy ra mảng ID [1, 5, 8...]
          setSelectedAmenities(ids);
        } else if (data.amenityIds) {
          // Trường hợp backend trả thẳng mảng ID
          setSelectedAmenities(data.amenityIds);
        }
        if (data.imageUrls) setExistingImages(data.imageUrls);
        else if (data.images) setExistingImages(data.images);
      } catch (err) {
        console.error(err);
        // THÔNG BÁO LỖI KHI LOAD DATA
        Swal.fire({
          icon: "error",
          title: "Lỗi tải dữ liệu",
          text: "Không tìm thấy thông tin khách sạn hoặc lỗi kết nối!",
        }).then(() => {
          navigate("/admin/hotels");
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

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
      if (match && match[1]) value = match[1];
    }
    setFormData((prev) => ({ ...prev, mapUrl: value }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedMainImage(file);
      setMainPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewGalleryFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setNewGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeNewGalleryImage = (index) => {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // --- 2. SỬA HÀM SUBMIT VỚI SWEETALERT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("hotelID", id);
      data.append("name", formData.name);
      data.append("slug", formData.slug);
      data.append("address", formData.address);
      data.append("locationID", formData.locationID);
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

      if (selectedMainImage) {
        data.append("ImageFile", selectedMainImage);
      }
      newGalleryFiles.forEach((file) => {
        data.append("GalleryFiles", file);
      });

      // --- 4. APPEND TIỆN ÍCH VÀO FORMDATA ĐỂ UPDATE ---
      selectedAmenities.forEach((id) => {
        data.append("AmenityIds", id);
      });
      const res = await fetch(`${API_BASE}/api/hotels/${id}`, {
        method: "PUT",
        body: data,
      });

      if (res.ok) {
        // THÔNG BÁO THÀNH CÔNG
        Swal.fire({
          icon: "success",
          title: "Cập nhật thành công!",
          text: "Thông tin khách sạn đã được lưu lại.",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/admin/hotels");
        });
      } else {
        const errorText = await res.text();
        Swal.fire({
          icon: "error",
          title: "Cập nhật thất bại",
          text: errorText,
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Lỗi kết nối",
        text: "Không thể kết nối đến máy chủ.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
    );

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Cập Nhật Khách Sạn
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
          {/* ... Phần Form Giữ Nguyên như code cũ ... */}
          {/* (Tôi rút gọn phần JSX form để tránh quá dài, bạn copy y nguyên phần form cũ vào đây là được) */}
          {/* ... Start Copy Form Content ... */}
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
                  Slug (URL)
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
                  name="locationID"
                  required
                  value={formData.locationID}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm p-2 border"
                >
                  <option value="">-- Chọn Tỉnh/Thành phố --</option>
                  {locations.map((loc) => (
                    <option key={loc.locationID} value={loc.locationID}>
                      {loc.locationName}
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

          {/* --- 5. CHÈN COMPONENT SELECTOR --- */}
          <div className="mt-6">
            <AmenitySelector
              type="Hotel"
              selectedIds={selectedAmenities}
              onChange={setSelectedAmenities}
            />
          </div>

          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Quản lý Hình ảnh
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-blue-800 mb-2">
                  1. Ảnh đại diện (Thay thế)
                </label>
                <div className="flex items-center gap-4 border p-4 rounded-lg bg-blue-50 border-blue-100">
                  <div className="w-24 h-24 border border-gray-300 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                    {mainPreview ? (
                      <img
                        src={mainPreview}
                        alt="New Main"
                        className="w-full h-full object-cover"
                      />
                    ) : existingImages.length > 0 ? (
                      <img
                        src={getImageUrl(existingImages[0])}
                        alt="Current Main"
                        className="w-full h-full object-cover opacity-80"
                      />
                    ) : (
                      <PhotoIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageChange}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-2 italic">
                      Chọn ảnh mới để thay thế ảnh hiện tại.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-teal-800 mb-2">
                  2. Thêm ảnh phụ mới
                </label>
                <div className="border p-4 rounded-lg bg-teal-50 border-teal-100">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer mb-3"
                  />

                  {newGalleryPreviews.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-bold text-teal-700 mb-1">
                        Ảnh chuẩn bị upload ({newGalleryPreviews.length}):
                      </p>
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                        {newGalleryPreviews.map((src, idx) => (
                          <div key={idx} className="relative group w-16 h-16">
                            <img
                              src={src}
                              alt="New Gallery"
                              className="w-full h-full object-cover rounded border border-teal-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewGalleryImage(idx)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {existingImages.length > 0 && (
                    <div className="mt-4 border-t border-teal-200 pt-2">
                      <p className="text-xs font-bold text-gray-600 mb-1">
                        Ảnh hiện có trên hệ thống:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {existingImages.map((imgUrl, idx) => (
                          <div key={idx} className="w-12 h-12 relative group">
                            <img
                              src={getImageUrl(imgUrl)}
                              alt="Old"
                              className="w-full h-full object-cover rounded border border-gray-300 grayscale group-hover:grayscale-0 transition"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* ... End Copy Form Content ... */}

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
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {submitting ? (
                "Đang lưu..."
              ) : (
                <>
                  <CloudArrowUpIcon className="w-5 h-5" />
                  Cập nhật
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
