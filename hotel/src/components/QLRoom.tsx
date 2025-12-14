import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function RoomList() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [hotelID, setHotelID] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* ========== LOAD KHÁCH SẠN ========== */
  useEffect(() => {
    fetch("http://localhost:5134/api/hotels")
      .then(res => res.json())
      .then(data => setHotels(data));
  }, []);

  /* ========== LOAD PHÒNG ========== */
  const loadRooms = (url: string) => {
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => setRooms(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRooms("http://localhost:5134/api/room/list");
  }, []);

  /* ========== FILTER ========== */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (hotelID) {
        loadRooms(`http://localhost:5134/api/room/by-hotel/${hotelID}`);
      } else if (search) {
        loadRooms(
          `http://localhost:5134/api/room/search?keyword=${encodeURIComponent(search)}`
        );
      } else {
        loadRooms("http://localhost:5134/api/room/list");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [hotelID, search]);


  /* ========== UI ========== */
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🏨 Quản lý phòng</h2>

      {/* ===== FILTER BAR ===== */}
      <div className="bg-white shadow rounded-lg p-4 mb-4 flex gap-4 items-center">
        <select
          value={hotelID}
          onChange={e => setHotelID(e.target.value)}
          className="border px-3 py-2 rounded w-60"
        >
          <option value="">-- Tất cả khách sạn --</option>
          {hotels.map(h => (
            <option key={h.hotelID} value={h.hotelID}>
              {h.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Tìm RoomCode / RoomNumber..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-60"
        />
      </div>

      {/* ===== TABLE ===== */}
      {loading ? (
        <div>Đang tải dữ liệu...</div>
      ) : rooms.length === 0 ? (
        <div>Không có phòng.</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* ===== TABLE ===== */}
          {loading ? (
            <div className="text-gray-500">Đang tải dữ liệu...</div>
          ) : rooms.length === 0 ? (
            <div className="text-gray-500">Không có phòng.</div>
          ) : (
            <div className="bg-white shadow-md rounded-xl overflow-hidden">
              <table className="w-full text-sm text-gray-700">
                <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Room Code</th>
                    <th className="px-4 py-3 text-center">Number</th>
                    <th className="px-4 py-3 text-left">Hotel</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-center">Floor</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Image</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
  {rooms.map((r) => (
    <tr
      key={r.roomId}
      className="hover:bg-slate-50 transition"
    >
      <td className="px-4 py-3 font-semibold">
        {r.roomCode}
      </td>

      <td className="px-4 py-3 text-center">
        {r.roomNumber}
      </td>

      <td className="px-4 py-3">
        {r.hotelName}
      </td>

      <td className="px-4 py-3">
        {r.roomTypeName}
      </td>

      <td className="px-4 py-3 text-center">
        {r.floor}
      </td>

      <td className="px-4 py-3 text-center">
        <span className="px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
          {r.status}
        </span>
      </td>

      <td className="px-4 py-3 text-center">
        {r.imageUrl ? (
          <img
            src={`http://localhost:5134${r.imageUrl}`}
            className="w-20 h-14 object-cover rounded-lg mx-auto"
          />
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>

      <td className="px-4 py-3 text-center">
        <Link
          to={`/rooms/edit/${r.roomId}`}
          className="inline-flex items-center justify-center
                     w-20 h-10 bg-green-600 text-white
                     rounded-md text-xs hover:bg-green-700"
        >
          Sửa
        </Link>
      </td>
    </tr>
  ))}
</tbody>

              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
