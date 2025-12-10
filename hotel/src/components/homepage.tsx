import React, { useEffect, useState } from "react";

export default function HotelsList() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5134/api/hotels")
      .then((res) => res.json())
      .then((data) => setHotels(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div className="text-red-500">Lỗi: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

      {hotels.map((h) => (
        <div 
          key={h.hotelID}
          className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition"
        >
          {/* Hình ảnh */}
          <img
            src={`http://localhost:5134${h.mainImageUrl}`}
            alt={h.name}
            className="w-full h-56 object-cover"
          />

          {/* Info */}
          <div className="p-4">
            <h3 className="text-xl font-bold text-gray-800">{h.name}</h3>

            <p className="text-gray-600 mt-1">
              📍 {h.address}, {h.city}, {h.country}
            </p>

            <p className="text-gray-700 mt-2 text-sm line-clamp-3">
              {h.description}
            </p>

            {/* Nút xem chi tiết */}
            <a 
              href={`/hotels/${h.hotelID}`}
              className="mt-4 inline-block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Xem chi tiết
            </a>
          </div>
        </div>
      ))}

    </div>
  );
}
