import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/mainlayout"; // Layout này chứa Sidebar Admin

// --- IMPORT CÁC TRANG ADMIN ---
import CustomerManagement from "./pages/frmQLKH";
import EmployeeManagement from "./pages/frmQLNV";
import HotelManagement from "./pages/Frm_DSKS";
import AddHotel from "./components/AddHotel";
import AdHotelDetail from "./components/AdminHotelDetail";
import RoomTypeManagemanet from "./pages/Frm_QLRoomType";
import RoomTypeList from "./pages/Frm_QLRoomType";
import RoomTypeAdd from "./components/AddRoomType";
import RoomTypeEdit from "./components/RoomTypeEdit";
import Availability from "./pages/AvailabilityCalendar";

// --- IMPORT TRANG USER ---
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========================================================= */}
        {/* 1. KHU VỰC PUBLIC (KHÁCH HÀNG) */}
        {/* ========================================================= */}

        {/* Khi vào trang chủ http://localhost:5173/ thì tự động chuyển sang /HomePage */}
        <Route path="/" element={<Navigate to="/HomePage" replace />} />

        {/* Route trang chủ: http://localhost:5173/HomePage */}
        <Route path="/HomePage" element={<HomePage />} />

        {/* ========================================================= */}
        {/* 2. KHU VỰC ADMIN (QUẢN TRỊ) */}
        {/* Tất cả đường dẫn bắt đầu bằng: http://localhost:5173/admin/... */}
        {/* ========================================================= */}
        <Route path="/admin" element={<Layout />}>
          {/* Trang mặc định khi vào /admin -> chuyển đến danh sách khách sạn hoặc trang nào bạn muốn */}
          <Route index element={<Navigate to="/admin/hotelsList" replace />} />

          {/* Quản lý Khách hàng: /admin/customers */}
          <Route path="customers" element={<CustomerManagement />} />

          {/* Quản lý Nhân viên: /admin/employees */}
          <Route path="employees" element={<EmployeeManagement />} />

          {/* --- QUẢN LÝ KHÁCH SẠN --- */}
          {/* /admin/hotelsList */}
          <Route path="hotelsList" element={<HotelManagement />} />
          {/* /admin/hotels/add */}
          <Route path="hotels/add" element={<AddHotel />} />
          {/* /admin/hotels/detail/:id */}
          <Route path="hotels/detail/:id" element={<AdHotelDetail />} />

          {/* --- QUẢN LÝ LOẠI PHÒNG --- */}
          {/* /admin/roomTypes */}
          <Route path="roomTypes" element={<RoomTypeList />} />
          {/* /admin/RoomTypes/add/:id */}
          <Route path="RoomTypes/add/:id" element={<RoomTypeAdd />} />
          {/* /admin/roomTypes/edit/:id */}
          <Route path="roomTypes/edit/:id" element={<RoomTypeEdit />} />
          {/* /admin/roomTypes/hotel/:id */}
          <Route path="roomTypes/hotel/:id" element={<RoomTypeManagemanet />} />

          {/* --- QUẢN LÝ LỊCH --- */}
          {/* /admin/availability */}
          <Route path="availability" element={<Availability />} />
        </Route>

        {/* Route 404 (Nếu nhập linh tinh) */}
        <Route
          path="*"
          element={
            <div className="p-10 text-center">404 - Trang không tồn tại</div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
