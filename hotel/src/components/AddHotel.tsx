import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// CẤU HÌNH API
const API_BASE = "http://localhost:5134";

export default function HotelAdd() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  // State riêng cho File ảnh và URL xem trước
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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

  // 1. Load danh sách Location
  useEffect(() => {
    fetch(`${API_BASE}/api/locations`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.items || [];
        setLocations(list);
      })
      .catch((err) => console.error("Không tải được location:", err));
  }, []);

  // 2. Hàm tạo Slug
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

  // 3. Xử lý thay đổi input text
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "name") {
        return { ...prev, name: value, slug: generateSlug(value) };
      }
      return { ...prev, [name]: value };
    });
  };

  // 4. Xử lý tách link Embed (QUAN TRỌNG: FIX LỖI MAP)
  const handleMapUrlChange = (e) => {
    let value = e.target.value;

    // Logic: Nếu user paste cả thẻ <iframe src="..."> thì tự tách lấy link bên trong src
    if (value.includes("<iframe") && value.includes('src="')) {
      const match = value.match(/src="([^"]*)"/);
      if (match && match[1]) {
        value = match[1]; // Lấy đúng đường dẫn https://...embed...
      }
    }

    setFormData((prev) => ({ ...prev, mapUrl: value }));
  };

  // 5. Xử lý chọn FILE ẢNH
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 6. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.locationID) {
      alert("Vui lòng chọn địa điểm!");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("slug", formData.slug);
      data.append("address", formData.address);
      data.append("locationID", formData.locationID);
      data.append("description", formData.description);
      data.append("starRating", formData.starRating);
      data.append("checkInTime", formData.checkInTime);
      data.append("checkOutTime", formData.checkOutTime);
      data.append("status", formData.status);

      // Quan trọng: Gửi link map đã xử lý
      data.append("mapUrl", formData.mapUrl);

      if (formData.mapLatitude)
        data.append("mapLatitude", formData.mapLatitude);
      if (formData.mapLongitude)
        data.append("mapLongitude", formData.mapLongitude);

      if (selectedImage) {
        data.append("ImageFile", selectedImage);
      }

      const res = await fetch(`${API_BASE}/api/hotels`, {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        alert("Thêm khách sạn thành công!");
        // --- FIX LỖI MÀN HÌNH TRẮNG ---
        // Trong App.js bạn khai báo: <Route path="hotelsList" ... />
        // Nên ở đây phải navigate về "/hotelsList"
        navigate("/hotelsList");
      } else {
        const errorText = await res.text();
        alert("Lỗi khi thêm: " + errorText);
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối server!");
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
          {/* Link quay lại cũng phải chuẩn */}
          <Link
            to="/hotelsList"
            className="text-gray-500 hover:text-blue-600 transition flex items-center gap-1"
          >
            ← Quay lại danh sách
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow border border-gray-200 p-6 sm:p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột Trái */}
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
                  Địa chỉ chi tiết (Hiển thị dạng chữ)
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

            {/* Cột Phải */}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Map Embed URL{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      (Vào Chia sẻ &rarr; Nhúng bản đồ)
                    </span>
                  </label>

                  {/* INPUT PASTE LINK GOOGLE MAP */}
                  <input
                    type="text"
                    name="mapUrl"
                    value={formData.mapUrl}
                    onChange={handleMapUrlChange}
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2 border text-sm"
                    placeholder='Paste thẻ <iframe...> hoặc link src="..."'
                  />

                  {/* --- KHUNG XEM TRƯỚC (PREVIEW) --- */}
                  {/* Nếu khung này hiện bản đồ thì Lưu xong mới hiện được ở trang Chi tiết */}
                  {formData.mapUrl && (
                    <div className="mt-2 w-full h-40 bg-gray-100 rounded overflow-hidden border">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Vĩ độ (Latitude)
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      name="mapLatitude"
                      value={formData.mapLatitude}
                      onChange={handleChange}
                      className="w-full border-gray-300 rounded-lg shadow-sm p-2 border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Kinh độ (Longitude)
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      name="mapLongitude"
                      value={formData.mapLongitude}
                      onChange={handleChange}
                      className="w-full border-gray-300 rounded-lg shadow-sm p-2 border text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* KHU VỰC UPLOAD ẢNH */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ảnh đại diện khách sạn
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border border-gray-300 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">No Img</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
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

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/hotelsList")}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {loading ? "Đang tải lên..." : "Lưu lại"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
