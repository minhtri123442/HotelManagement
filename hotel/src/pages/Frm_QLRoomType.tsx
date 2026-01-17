import RoomTypeList from "./Admin/RoomTypeManagement";
export default function frm_RoomType() {
  return (
    <div className="p-4">
      {/* Gọi Component bảng dữ liệu */}
      <RoomTypeList />
    </div>
  );
}
