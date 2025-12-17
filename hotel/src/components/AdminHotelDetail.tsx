import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

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
        // KIỂM TRA DỮ LIỆU TẠI ĐÂY
        console.log("Dữ liệu khách sạn nhận được:", data);
        if (!data.mapUrl) console.warn("CẢNH BÁO: API trả về mapUrl rỗng!");
        setHotel(data);
      })
      .catch((err) => {
        console.error(err);
        navigate("/hotelsList");
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
        navigate("/hotelsList");
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

  const renderStars = (count) =>
    [...Array(5)].map((_, i) => (
      <span key={i} className={i < count ? "text-yellow-400" : "text-gray-200"}>
        ★
      </span>
    ));

  const displayImages =
    hotel?.imageUrls?.length > 0 ? hotel.imageUrls : hotel?.images || [];

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;
  if (!hotel) return null;

  // Sử dụng mapUrl hoặc MapUrl (đề phòng API trả về chữ hoa)
  const mapLink = hotel.mapUrl || hotel.MapUrl;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto mb-8">
        <Link
          to="/hotelsList"
          className="text-sm text-gray-500 hover:text-blue-600 mb-2 inline-block"
        >
          ← Quay lại danh sách
        </Link>
        <div className="flex justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
            <p className="text-sm text-gray-500">ID: {hotel.hotelID}</p>
          </div>
          <button
            onClick={handleDelete}
            className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded h-10"
          >
            Xóa
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold mb-4 border-b pb-2">Thông tin</h3>
            <p className="font-bold text-gray-700">Địa chỉ:</p>
            <p className="text-lg text-gray-900 mb-4">
              {hotel.address}, {hotel.city}
            </p>
            <p className="font-bold text-gray-700">Mô tả:</p>
            <p className="text-gray-600 whitespace-pre-wrap">
              {hotel.description}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold mb-4 border-b pb-2">Thư viện ảnh</h3>
            <div className="grid grid-cols-4 gap-4">
              {displayImages.map((img, i) => (
                <img
                  key={i}
                  src={getImageSrc(img)}
                  className="w-full h-24 object-cover rounded"
                  alt="Hotel"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold mb-4">Vận hành</h3>
            <div className="flex justify-between py-2 border-b">
              <span>Hạng sao</span>
              <span>{renderStars(hotel.starRating)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Check-in</span>
              <span className="font-bold">{hotel.checkInTime}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Check-out</span>
              <span className="font-bold">{hotel.checkOutTime}</span>
            </div>

            {/* GOOGLE MAP */}
            <div className="mt-4 border rounded overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500 uppercase">
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
                    <span>⚠️ Chưa có bản đồ</span>
                    <span className="text-[10px] text-gray-300">
                      (Kiểm tra lại Backend)
                    </span>
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
