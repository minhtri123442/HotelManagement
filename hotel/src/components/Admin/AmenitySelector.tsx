import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { ICON_OPTIONS } from "./IconPicker"; // Import lại danh sách icon để map hiển thị

// API lấy danh sách
const API_AMENITIES = "http://localhost:5134/api/Amenities";

interface AmenitySelectorProps {
  type: "Hotel" | "Room"; // Để lọc: Chỉ hiện tiện ích Khách sạn hoặc chỉ hiện tiện ích Phòng
  selectedIds: number[]; // Danh sách ID đang được chọn (từ cha truyền xuống)
  onChange: (ids: number[]) => void; // Hàm báo ra ngoài là danh sách đã thay đổi
}

export default function AmenitySelector({
  type,
  selectedIds,
  onChange,
}: AmenitySelectorProps) {
  const [amenities, setAmenities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Load danh sách tiện ích từ API khi component hiện lên
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const res = await axios.get(API_AMENITIES);
        // Lọc luôn: Nếu type="Hotel" thì chỉ lấy tiện ích Hotel
        const filtered = res.data.filter((a: any) => a.type === type);
        setAmenities(filtered);
      } catch (err) {
        console.error("Lỗi load amenities:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAmenities();
  }, [type]);

  // 2. Hàm xử lý khi click vào 1 tiện ích
  const toggleAmenity = (id: number) => {
    if (selectedIds.includes(id)) {
      // Nếu có rồi -> Bỏ chọn (Filter bỏ id đó ra)
      onChange(selectedIds.filter((itemId) => itemId !== id));
    } else {
      // Nếu chưa có -> Thêm vào
      onChange([...selectedIds, id]);
    }
  };

  // 3. Hàm tìm icon component
  const getIcon = (iconClass: string) => {
    const found = ICON_OPTIONS.find((opt) => opt.value === iconClass);
    return found ? found.icon : null;
  };

  if (loading)
    return (
      <div className="text-sm text-gray-500 italic">Đang tải tiện ích...</div>
    );

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase">
        Chọn tiện ích {type === "Hotel" ? "Khách sạn" : "Phòng"}
      </h4>

      {amenities.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có tiện ích nào loại này.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {amenities.map((item) => {
            const isSelected = selectedIds.includes(item.amenityId);
            return (
              <div
                key={item.amenityId}
                onClick={() => toggleAmenity(item.amenityId)}
                className={`relative cursor-pointer flex items-center gap-2 p-3 rounded-lg border transition-all select-none ${
                  isSelected
                    ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm"
                    : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                }`}
              >
                {/* Icon */}
                <div
                  className={`${
                    isSelected ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {getIcon(item.iconClass)}
                </div>

                {/* Tên */}
                <span
                  className={`text-sm font-medium ${
                    isSelected ? "text-blue-700" : "text-gray-600"
                  }`}
                >
                  {item.name}
                </span>

                {/* Dấu tích xanh khi chọn */}
                {isSelected && (
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 absolute top-[-8px] right-[-8px] bg-white rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
