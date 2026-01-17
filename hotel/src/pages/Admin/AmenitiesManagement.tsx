import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

// Import Component IconPicker và Danh sách Icon để hiển thị trong bảng
import IconPicker, { ICON_OPTIONS } from "../../components/Admin/IconPicker";

// --- CẤU HÌNH API ---
const API_URL = "http://localhost:5134/api/Amenities";

export default function AmenitiesManagement() {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Modal & Form
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // State Form Data
  const [formData, setFormData] = useState({
    amenityId: 0,
    name: "",
    iconClass: "",
    type: "Room", // Default
  });

  // --- 1. Load dữ liệu ---
  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setAmenities(response.data);
    } catch (error) {
      console.error("Lỗi tải amenities:", error);
      // Swal.fire("Lỗi", "Không thể kết nối đến server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  // --- Helper: Lấy Icon Component từ string iconClass ---
  const getIconDisplay = (iconClass: string) => {
    const found = ICON_OPTIONS.find((opt) => opt.value === iconClass);
    return found ? (
      <div className="tooltip" title={found.label}>
        {found.icon}
      </div>
    ) : (
      <span className="text-gray-300 text-xs italic">No Icon</span>
    );
  };

  // --- 2. Xử lý Modal ---
  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({ amenityId: 0, name: "", iconClass: "", type: "Room" });
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setIsEditMode(true);
    setFormData({
      amenityId: item.amenityId,
      name: item.name,
      iconClass: item.iconClass || "",
      type: item.type || "Room",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // --- 3. Submit Form (Thêm/Sửa) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate cơ bản
    if (!formData.name.trim()) {
      Swal.fire("Thiếu thông tin", "Vui lòng nhập tên tiện ích!", "warning");
      return;
    }
    if (!formData.iconClass) {
      Swal.fire("Thiếu thông tin", "Vui lòng chọn biểu tượng!", "warning");
      return;
    }

    try {
      if (isEditMode) {
        // Cập nhật
        await axios.put(`${API_URL}/${formData.amenityId}`, formData);
        Swal.fire({
          icon: "success",
          title: "Cập nhật thành công!",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        // Thêm mới
        await axios.post(API_URL, formData);
        Swal.fire({
          icon: "success",
          title: "Thêm mới thành công!",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });
      }
      handleCloseModal();
      fetchAmenities(); // Tải lại danh sách
    } catch (error) {
      console.error("Lỗi submit:", error);
      Swal.fire("Thất bại", "Có lỗi xảy ra khi lưu dữ liệu.", "error");
    }
  };

  // --- 4. Xóa ---
  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Xóa tiện ích này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa luôn!",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/${id}`);
          Swal.fire("Đã xóa!", "Tiện ích đã bị xóa.", "success");
          fetchAmenities();
        } catch (error) {
          Swal.fire(
            "Lỗi",
            "Không thể xóa (có thể đang được sử dụng).",
            "error"
          );
        }
      }
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Tiện ích</h1>
          <p className="text-sm text-gray-500">
            Quản lý danh sách tiện ích phòng và khách sạn
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md transition active:scale-95"
        >
          <PlusIcon className="h-5 w-5" /> Thêm Tiện ích
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="p-4 border-b">ID</th>
                <th className="p-4 border-b text-center">Biểu tượng</th>
                <th className="p-4 border-b">Tên tiện ích</th>
                <th className="p-4 border-b">Loại</th>
                <th className="p-4 border-b text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : amenities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <MagnifyingGlassIcon className="w-10 h-10 text-gray-300 mb-2" />
                      Chưa có dữ liệu tiện ích nào.
                    </div>
                  </td>
                </tr>
              ) : (
                amenities.map((item: any) => (
                  <tr
                    key={item.amenityId}
                    className="hover:bg-blue-50/50 transition duration-150"
                  >
                    <td className="p-4 text-sm text-gray-500">
                      #{item.amenityId}
                    </td>

                    {/* CỘT ICON: HIỂN THỊ ICON THẬT THAY VÌ TEXT */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 mx-auto shadow-sm border border-blue-100">
                        {getIconDisplay(item.iconClass)}
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-gray-800">
                      {item.name}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          item.type === "Room"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}
                      >
                        {item.type === "Room" ? "Phòng" : "Khách sạn"}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="Sửa"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.amenityId)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="Xóa"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {isEditMode ? "Cập nhật Tiện ích" : "Thêm Tiện ích mới"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1 transition"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Tên tiện ích */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Tiện ích <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 focus:bg-white"
                  placeholder="Ví dụ: Máy lạnh, Wifi tốc độ cao..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              {/* Loại */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại (Type)
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="Room"
                      checked={formData.type === "Room"}
                      onChange={() =>
                        setFormData({ ...formData, type: "Room" })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">
                      Tiện ích Phòng
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="Hotel"
                      checked={formData.type === "Hotel"}
                      onChange={() =>
                        setFormData({ ...formData, type: "Hotel" })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">
                      Tiện ích Khách sạn
                    </span>
                  </label>
                </div>
              </div>

              {/* ICON PICKER COMPONENT (ĐÃ TÁCH RA) */}
              <IconPicker
                selectedIcon={formData.iconClass}
                onSelect={(val) => setFormData({ ...formData, iconClass: val })}
              />

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition transform active:scale-95"
                >
                  {isEditMode ? "Lưu thay đổi" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
