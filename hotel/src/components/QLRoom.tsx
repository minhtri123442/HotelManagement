import React, { useEffect, useState } from "react";

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Lấy danh sách phòng
  useEffect(() => {
    fetch("http://localhost:5134/api/room/list")
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`HTTP ${res.status} - ${txt}`);
        }
        return res.json();
      })
      .then((data) => setRooms(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Tìm kiếm phòng theo RoomCode hoặc RoomNumber
  useEffect(() => {
    const delay = setTimeout(() => {
      if (search === "") {
        fetch("http://localhost:5134/api/room/list")
          .then((res) => res.json())
          .then((data) => setRooms(data));
        return;
      }

      fetch(
        `http://localhost:5134/api/room/search?keyword=${encodeURIComponent(
          search
        )}`
      )
        .then((res) => res.json())
        .then((data) => setRooms(data || []));
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  const handleDelete = (id: number) => {
    if (!window.confirm("Xóa phòng này?")) return;

    fetch(`http://localhost:5134/api/room/delete/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.text())
      .then(() => {
        setRooms((prev) => prev.filter((x: any) => x.roomID !== id));
      });
  };

  if (loading) return <div>Đang tải dữ liệu phòng...</div>;
  if (error) return <div className="text-red-500">Lỗi: {error}</div>;

  return (
    <div className="p-4">
      {/* ======= Thanh tìm kiếm + nút Thêm ======= */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm phòng..."
          className="border px-3 py-2 rounded text-sm w-60"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <a
          href="/rooms/add"
          className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          + Thêm phòng
        </a>
      </div>

      {rooms.length === 0 ? (
        <div>Không có phòng nào.</div>
      ) : (
        <table className="w-full border border-gray-400 border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">RoomCode</th>
              <th className="border p-2">RoomNumber</th>
              <th className="border p-2">Hotel</th>
              <th className="border p-2">Room Type</th>
              <th className="border p-2">Floor</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Note</th>
              <th className="border p-2">Image</th>
              <th className="border p-2">Chức năng</th>
            </tr>
          </thead>

          <tbody>
            {rooms.map((r: any) => (
              <tr key={r.roomID} className="hover:bg-gray-50">
                <td className="border p-2">{r.roomCode}</td>
                <td className="border p-2">{r.roomNumber}</td>
                <td className="border p-2">{r.hotelName}</td>
                <td className="border p-2">{r.roomTypeName}</td>
                <td className="border p-2">{r.floor}</td>
                <td className="border p-2">{r.status}</td>
                <td className="border p-2">{r.note}</td>

                <td className="border p-2 text-center">
                  {r.imageUrl ? (
                    <img
                      src={`http://localhost:5134${r.imageUrl}`}
                      className="w-[100px] h-[80px] object-cover rounded"
                    />
                  ) : (
                    <span>Không ảnh</span>
                  )}
                </td>

                <td className="border p-2">
                  <div className="flex gap-2">
                    <a
                      href={`/rooms/edit/${r.roomID}`}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      Sửa
                    </a>

                    <button
                      onClick={() => handleDelete(r.roomID)}
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
