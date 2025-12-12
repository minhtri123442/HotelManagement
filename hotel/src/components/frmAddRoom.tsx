import React, { useEffect, useState } from "react";

export default function FrmAddRoom() {
  const [roomCode, setRoomCode] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [hotelID, setHotelID] = useState("");
  const [roomTypeID, setRoomTypeID] = useState("");
  const [floor, setFloor] = useState("");
  const [status, setStatus] = useState("Empty");
  const [note, setNote] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [hotels, setHotels] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);

  // Load khách sạn
  useEffect(() => {
    fetch("http://localhost:5134/api/hotel/list")
      .then(res => res.json())
      .then(data => setHotels(data));
  }, []);

  // Load loại phòng
  useEffect(() => {
    fetch("http://localhost:5134/api/roomtype/list")
      .then(res => res.json())
      .then(data => setRoomTypes(data));
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!roomCode || !roomNumber || !hotelID || !roomTypeID) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const formData = new FormData();
    formData.append("RoomCode", roomCode);
    formData.append("RoomNumber", roomNumber);
    formData.append("HotelID", hotelID);
    formData.append("RoomTypeID", roomTypeID);
    formData.append("Floor", floor);
    formData.append("Status", status);
    formData.append("Note", note);

    if (imageFile) {
      formData.append("ImageFile", imageFile);
    }

    const res = await fetch("http://localhost:5134/api/room/add", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("Thêm phòng thành công!");
      window.location.href = "/rooms";
    } else {
      const txt = await res.text();
      alert("Lỗi: " + txt);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">➕ Thêm phòng</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label>Mã phòng (RoomCode)</label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="Ví dụ: RM021"
          />
        </div>

        <div>
          <label>Số phòng (RoomNumber)</label>
          <input
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="101, 102..."
          />
        </div>

        <div>
          <label>Khách sạn</label>
          <select
            value={hotelID}
            onChange={(e) => setHotelID(e.target.value)}
            className="border p-2 w-full rounded"
          >
            <option value="">-- Chọn khách sạn --</option>
            {hotels.map((h: any) => (
              <option key={h.hotelID} value={h.hotelID}>
                {h.hotelName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Loại phòng</label>
          <select
            value={roomTypeID}
            onChange={(e) => setRoomTypeID(e.target.value)}
            className="border p-2 w-full rounded"
          >
            <option value="">-- Chọn loại phòng --</option>
            {roomTypes.map((rt: any) => (
              <option key={rt.roomTypeID} value={rt.roomTypeID}>
                {rt.typeName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Tầng</label>
          <input
            type="number"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label>Trạng thái</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 w-full rounded"
          >
            <option value="Empty">Empty</option>
            <option value="Booked">Booked</option>
            <option value="Staying">Staying</option>
          </select>
        </div>

        <div>
          <label>Ghi chú</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label>Ảnh chính</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e: any) => setImageFile(e.target.files[0])}
            className="border p-2 w-full rounded"
          />
        </div>

        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Lưu phòng
        </button>
      </form>
    </div>
  );
}
