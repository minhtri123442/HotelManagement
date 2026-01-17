import React from "react";
import {
  WifiIcon,
  TvIcon,
  TruckIcon,
  SunIcon, // Dùng cho Máy lạnh (Điều hòa nhiệt độ)
  SparklesIcon, // Dùng cho Máy sấy tóc / Spa (Làm đẹp/Sạch sẽ)
  BoltIcon,
  MusicalNoteIcon,
  ComputerDesktopIcon,
  HomeModernIcon,
  FireIcon, // Dùng cho Bồn tắm nóng
  ArchiveBoxIcon, // Dùng cho Két sắt
  VideoCameraIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  CakeIcon, // Dùng cho Nhà hàng (Ăn uống)
  CubeIcon, // Dùng cho Tủ lạnh (Hình khối hộp)
  HeartIcon, // Dùng cho Spa (Sức khỏe)
} from "@heroicons/react/24/outline";

// QUAN TRỌNG: 'value' ở đây PHẢI GIỐNG Y HỆT 'IconClass' trong Database (Backend)
export const ICON_OPTIONS = [
  // --- Tiện ích PHÒNG (Room) ---
  {
    value: "wifi",
    label: "Wifi miễn phí",
    icon: <WifiIcon className="w-6 h-6" />,
  },
  {
    value: "air-conditioner",
    label: "Máy lạnh",
    icon: <SunIcon className="w-6 h-6" />,
  }, // Đã sửa từ 'ac' thành 'air-conditioner'
  { value: "tv", label: "TV", icon: <TvIcon className="w-6 h-6" /> },
  {
    value: "hair-dryer",
    label: "Máy sấy tóc",
    icon: <SparklesIcon className="w-6 h-6" />,
  }, // Mới thêm
  {
    value: "fridge",
    label: "Tủ lạnh mini",
    icon: <CubeIcon className="w-6 h-6" />,
  }, // Mới thêm
  {
    value: "hot-tub",
    label: "Bồn tắm nóng",
    icon: <FireIcon className="w-6 h-6" />,
  }, // Đã sửa từ 'hot-water'
  {
    value: "safe",
    label: "Két sắt",
    icon: <ArchiveBoxIcon className="w-6 h-6" />,
  },

  // --- Tiện ích KHÁCH SẠN (Hotel) ---
  {
    value: "swimming-pool",
    label: "Hồ bơi",
    icon: <SparklesIcon className="w-6 h-6 text-blue-500" />,
  }, // Đã sửa từ 'pool', dùng icon Sparkles hoặc icon khác tùy bro
  { value: "gym", label: "Phòng Gym", icon: <BoltIcon className="w-6 h-6" /> },
  {
    value: "parking",
    label: "Bãi đậu xe",
    icon: <TruckIcon className="w-6 h-6" />,
  },
  {
    value: "restaurant",
    label: "Nhà hàng",
    icon: <CakeIcon className="w-6 h-6" />,
  }, // Mới thêm
  {
    value: "bar",
    label: "Quầy Bar",
    icon: <MusicalNoteIcon className="w-6 h-6" />,
  },
  {
    value: "reception",
    label: "Lễ tân 24/7",
    icon: <HomeModernIcon className="w-6 h-6" />,
  },
  {
    value: "spa",
    label: "Dịch vụ Spa",
    icon: <HeartIcon className="w-6 h-6" />,
  }, // Mới thêm

  // --- Các icon dự phòng khác (Optional) ---
  {
    value: "work",
    label: "Bàn làm việc",
    icon: <ComputerDesktopIcon className="w-6 h-6" />,
  },
  {
    value: "cctv",
    label: "Camera",
    icon: <VideoCameraIcon className="w-6 h-6" />,
  },
  {
    value: "internet",
    label: "Internet dây",
    icon: <GlobeAltIcon className="w-6 h-6" />,
  },
  {
    value: "security",
    label: "Bảo vệ",
    icon: <ShieldCheckIcon className="w-6 h-6" />,
  },
  {
    value: "card",
    label: "Thanh toán thẻ",
    icon: <CreditCardIcon className="w-6 h-6" />,
  },
];

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (iconValue: string) => void;
}

// Component hiển thị lưới chọn
export default function IconPicker({
  selectedIcon,
  onSelect,
}: IconPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Chọn Biểu tượng (Icon) <span className="text-red-500">*</span>
      </label>

      {/* Lưới hiển thị các icon */}
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50 max-h-60 overflow-y-auto custom-scrollbar">
        {ICON_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition duration-200 group h-20 ${
              selectedIcon === option.value
                ? "bg-blue-100 border-blue-500 text-blue-700 ring-2 ring-blue-200 shadow-sm"
                : "bg-white border-gray-200 text-gray-500 hover:bg-white hover:border-blue-300 hover:text-blue-500 hover:shadow-sm"
            }`}
            title={option.label}
          >
            <div className="mb-1">{option.icon}</div>
            <span className="text-[10px] leading-tight w-full text-center font-medium overflow-hidden text-ellipsis px-1">
              {option.label}
            </span>
          </button>
        ))}
      </div>

      {/* Hiển thị giá trị đã chọn */}
      {selectedIcon ? (
        <p className="text-xs text-blue-600 mt-2 font-medium flex items-center gap-1 animate-pulse">
          Đang chọn mã:{" "}
          <span className="font-bold bg-blue-100 px-2 py-0.5 rounded text-gray-800">
            {selectedIcon}
          </span>
        </p>
      ) : (
        <p className="text-xs text-gray-400 mt-2 italic">
          Vui lòng chọn một biểu tượng.
        </p>
      )}
    </div>
  );
}
