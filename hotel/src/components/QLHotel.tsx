import React, { useEffect, useState } from "react";

export default function HotelsList() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState(""); // <-- thêm state tìm kiếm

  useEffect(() => {
    fetch("http://localhost:5134/api/hotels")
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`HTTP ${res.status} - ${txt}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("DATA NHẬN TỪ API:", data);
        setHotels(data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search === "") {
        // nếu không nhập gì → load danh sách ban đầu
        fetch("http://localhost:5134/api/hotels")
          .then((res) => res.json())
          .then((data) => setHotels(data));
        return;
      }

      fetch(
        `http://localhost:5134/api/hotels/search?keyword=${encodeURIComponent(
          search
        )}`
      )
        .then((res) => res.json())
        .then((data) => setHotels(data || []))
        .catch((err) => console.error(err));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div className="text-red-500">Lỗi: {error}</div>;

  return (
    <div className="p-4">
      {/* ======= Thanh tìm kiếm + nút Thêm ======= */}
      <div className="flex justify-between items-center mb-4">
        {/* Ô tìm kiếm */}
        <input
          type="text"
          placeholder="Tìm kiếm khách sạn..."
          className="border px-3 py-2 rounded text-sm w-60"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <a
          href="/hotels/add"
          className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          + Thêm khách sạn
        </a>
      </div>

      {hotels.length === 0 ? (
        <div>Không tìm thấy khách sạn nào.</div>
      ) : (
        <table className="w-full border border-gray-400 border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">HotelCode</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Address</th>
              <th className="border p-2">City</th>
              <th className="border p-2">Country</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Main Image</th>
              <th className="border p-2">CreatedAt</th>
              <th className="border p-2">Chức năng</th>
            </tr>
          </thead>

          <tbody>
            {hotels.map((h) => (
              <tr key={h.hotelID} className="hover:bg-gray-50">
                <td className="border p-2">{h.hotelCode}</td>
                <td className="border p-2">{h.name}</td>
                <td className="border p-2">{h.address}</td>
                <td className="border p-2">{h.city}</td>
                <td className="border p-2">{h.country}</td>
                <td className="border p-2">{h.phone}</td>
                <td className="border p-2">{h.email}</td>
                <td className="border p-2">{h.description}</td>
                <td className="border p-2">{h.status}</td>

                <td className="border p-2 text-center">
                  {h.mainImageUrl ? (
                    <img
                      src={`http://localhost:5134${h.mainImageUrl}`}
                      alt="main"
                      className="w-[100px] h-[80px] object-cover rounded"
                    />
                  ) : (
                    <span>Không có ảnh</span>
                  )}
                </td>

                <td className="border p-2">
                  {new Date(h.createdAt).toLocaleDateString()}
                </td>

                <td className="border p-2">
                  <div className="flex gap-2">
                    <a
                      href={`/hotels/edit/${h.hotelID}`}
                      className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    >
                      Sửa
                    </a>

                    <button
                      onClick={() => handleDelete(h.hotelID)}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
