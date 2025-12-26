import RoomTypeList from "../components/RoomType";
export default function frm_RoomType() {
  return (
    <div className="p-4">
      {/* Tiêu đề trang */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Loại phòng</h1>
        <p className="text-gray-600">Danh sách các loại phòng của khách sạn</p>
      </div>

      {/* Gọi Component bảng dữ liệu */}
      <RoomTypeList />
    </div>
  );
}
