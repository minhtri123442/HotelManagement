import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

// --- IMPORT HEROICONS ---
import {
  ArrowLeftIcon,
  TrashIcon,
  MapPinIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";

const API_BASE = "http://localhost:5134";

export default function AdminHotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/hotels/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not Found");
        return res.json();
      })
      .then((data) => {
        console.log("Dữ liệu khách sạn nhận được:", data);
        if (!data.mapUrl) console.warn("CẢNH BÁO: API trả về mapUrl rỗng!");
        setHotel(data);
      })
      .catch((err) => {
        console.error(err);
        navigate("/admin/hotels");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/hotels/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Đã xóa thành công!");
        navigate("/admin/hotels");
      } else alert("Xóa thất bại.");
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  const getImageSrc = (path) => {
    if (!path) return "https://via.placeholder.com/400x300";
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE}${cleanPath}`;
  };

  // Helper render sao dùng Heroicons
  const renderStars = (count) =>
    [...Array(5)].map((_, i) =>
      i < count ? (
        <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
      ) : (
        <StarIconOutline key={i} className="w-5 h-5 text-gray-300" />
      )
    );

  const displayImages =
    hotel?.imageUrls?.length > 0 ? hotel.imageUrls : hotel?.images || [];

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;
  if (!hotel) return null;

  const mapLink = hotel.mapUrl || hotel.MapUrl;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto mb-8">
        <Link
          to="/admin/hotels"
          className="text-sm text-gray-500 hover:text-blue-600 mb-2 inline-flex items-center gap-1"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Quay lại danh sách
        </Link>
        <div className="flex justify-between items-center mt-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
            <p className="text-sm text-gray-500 mt-1">ID: {hotel.hotelID}</p>
          </div>
          <button
            onClick={handleDelete}
            className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded h-10 flex items-center gap-2 hover:bg-red-50 transition"
          >
            <TrashIcon className="w-5 h-5" />
            Xóa
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold mb-4 border-b pb-2 text-lg">Thông tin</h3>
            <p className="font-bold text-gray-700 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-gray-500" />
              Địa chỉ:
            </p>
            <p className="text-lg text-gray-900 mb-6 pl-7">
              {hotel.address}, {hotel.city}
            </p>

            <p className="font-bold text-gray-700">Mô tả:</p>
            <p className="text-gray-600 whitespace-pre-wrap mt-2 leading-relaxed">
              {hotel.description}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold mb-4 border-b pb-2 text-lg">
              Thư viện ảnh
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {displayImages.length > 0 ? (
                displayImages.map((img, i) => (
                  <img
                    key={i}
                    src={getImageSrc(img)}
                    className="w-full h-24 object-cover rounded border border-gray-100"
                    alt="Hotel"
                  />
                ))
              ) : (
                <div className="col-span-4 text-center text-gray-400 py-4">
                  Không có hình ảnh
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold mb-4 text-lg">Vận hành</h3>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Hạng sao</span>
              <span className="flex">{renderStars(hotel.starRating)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600 flex items-center gap-1">
                <ClockIcon className="w-4 h-4" /> Check-in
              </span>
              <span className="font-bold">{hotel.checkInTime}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 flex items-center gap-1">
                <ClockIcon className="w-4 h-4" /> Check-out
              </span>
              <span className="font-bold">{hotel.checkOutTime}</span>
            </div>

            {/* GOOGLE MAP */}
            <div className="mt-6 border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500 uppercase border-b">
                Vị trí bản đồ
              </div>
              <div className="h-48 bg-gray-200">
                {mapLink ? (
                  <iframe
                    src={mapLink}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    title="Map"
                    className="w-full h-full"
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-2">
                    <span> Chưa có bản đồ</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
