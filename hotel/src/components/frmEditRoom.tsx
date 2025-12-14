import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function FrmEditRoom() {
  const { id } = useParams(); // roomID
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [hotelID, setHotelID] = useState("");
  const [roomTypeID, setRoomTypeID] = useState("");
  const [floor, setFloor] = useState("");
  const [status, setStatus] = useState("Empty");
  const [note, setNote] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [oldImage, setOldImage] = useState("");

  const [hotels, setHotels] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);

  /* ================= LOAD DATA ================= */

  // Load khách sạn
  useEffect(() => {
    fetch("http://localhost:5134/api/hotels")
      .then(res => res.json())
      .then(data => setHotels(data));
  }, []);

  // Load loại phòng
  useEffect(() => {
    fetch("http://localhost:5134/api/roomtype/list")
      .then(res => res.json())
      .then(data => setRoomTypes(data));
  }, []);

  // Load chi tiết phòng
  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:5134/api/room/detail/${id}`)
      .then(res => res.json())
      .then(r => {
        setRoomCode(r.roomCode);
        setRoomNumber(r.roomNumber);
        setHotelID(r.hotelID.toString());
        setRoomTypeID(r.roomTypeID.toString());
        setFloor(r.floor?.toString() || "");
        setStatus(r.status);
        setNote(r.note || "");
        setOldImage(r.image);
      });
  }, [id]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("RoomID", id!);
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

    const res = await fetch(
      `http://localhost:5134/api/room/update/${id}`,
      {
        method: "PUT",
        body: formData,
      }
    );

    if (res.ok) {
      alert("Cập nhật phòng thành công!");
      navigate("/rooms");
    } else {
      alert("Lỗi khi cập nhật phòng");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">✏️ Sửa phòng</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label>Mã phòng</label>
          <input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label>Số phòng</label>
          <input
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label>Khách sạn</label>
          <select
            value={hotelID}
            onChange={(e) => setHotelID(e.target.value)}
            className="border p-2 w-full rounded"
          >
            <option value="">-- Chọn --</option>
            {hotels.map(h => (
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
            <option value="">-- Chọn --</option>
            {roomTypes.map(rt => (
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

        {oldImage && (
          <img
            src={`http://localhost:5134/uploads/${oldImage}`}
            className="w-32 rounded mb-2"
          />
        )}

        <div>
          <label>Đổi ảnh (nếu có)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e: any) => setImageFile(e.target.files[0])}
            className="border p-2 w-full rounded"
          />
        </div>

        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Cập nhật phòng
        </button>
      </form>
    </div>
  );
}
