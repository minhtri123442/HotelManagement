import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../Layout/mainlayout"; // Layout Admin

// --- IMPORT CÁC TRANG ADMIN ---
import CustomerManagement from "../pages/Customer";
import EmployeeManagement from "../pages/frmQLNV";
import HotelManagement from "../pages/Frm_DSKS";
import AddHotel from "../pages/Admin/AddHotelPage";
import AdHotelDetail from "../pages/Admin/AdminHotelDetail";
import RoomTypeList from "../pages/Frm_QLRoomType";
import RoomTypeManagemanet from "../pages/Frm_QLRoomType"; // (Lưu ý: Check lại xem file này có trùng với dòng trên ko nhé)
import RoomTypeAdd from "../pages/Admin/AddRoomTypePage";
import RoomTypeEdit from "../pages/Admin/RoomTypeEditPage";
import Availability from "../pages/AvailabilityCalendar";
import HotelEdit from "../pages/Admin/EditHotelPage";
import AdminBooking from "../pages/Admin/adminBooking";

export default function AdminRoutes() {
  const userStr = localStorage.getItem("user");

  // 1. Kiểm tra kỹ hơn: Nếu không có userStr hoặc là chuỗi "null"
  if (!userStr || userStr === "null") {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);

  // 2. Kiểm tra quyền Admin
  if (user.role !== "Admin") {
    return <Navigate to="/login" replace />;
  }
  return (
    <Routes>
      {/* Layout bọc bên ngoài tất cả các trang Admin */}
      <Route element={<Layout />}>
        {/* Mặc định vào /admin sẽ nhảy sang hotelsList */}
        <Route index element={<Navigate to="hotelsList" replace />} />

        {/* --- QUẢN LÝ USER/NHÂN VIÊN --- */}
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="employees" element={<EmployeeManagement />} />

        {/* --- QUẢN LÝ KHÁCH SẠN --- */}
        <Route path="hotelsList" element={<HotelManagement />} />
        <Route path="hotels/add" element={<AddHotel />} />
        <Route path="hotels/detail/:id" element={<AdHotelDetail />} />
        <Route path="hotels/edit/:id" element={<HotelEdit />} />

        {/* --- QUẢN LÝ LOẠI PHÒNG --- */}
        <Route path="roomTypes" element={<RoomTypeList />} />
        <Route path="RoomTypes/add/:id" element={<RoomTypeAdd />} />
        <Route path="roomTypes/edit/:id" element={<RoomTypeEdit />} />
        <Route path="roomTypes/hotel/:id" element={<RoomTypeManagemanet />} />

        {/* --- QUẢN LÝ LỊCH --- */}
        <Route path="availability" element={<Availability />} />
        {/* --- QUẢN LÝ ĐẶT PHÒNG --- */}
        <Route path="bookings" element={<AdminBooking />} />
      </Route>
    </Routes>
  );
}
