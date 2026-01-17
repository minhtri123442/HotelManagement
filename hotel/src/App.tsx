import { Routes, Route, Navigate } from "react-router-dom";

// 1. Import Layouts
import MainLayout from "./Layout/mainlayout"; // Layout cho khách
import AdminLayout from "./Layout/dashboard"; // Layout cho Admin

// 2. Import Pages - ADMIN
import HotelManagement from "./pages/Admin/HotelManagement";
import AddHotelPage from "./pages/Admin/AddHotelPage";
import EditHotelPage from "./pages/Admin/EditHotelPage";
import DetailHotelPage from "./pages/Admin/AdminHotelDetail";
import RoomTypeManagement from "./pages/Admin/RoomTypeManagement";
import AddRoomTypePage from "./pages/Admin/AddRoomTypePage";
import EditRoomType from "./pages/Admin/RoomTypeEditPage";
import AmenitiesManagement from "./pages/Admin/AmenitiesManagement";
import AdminBooking from "./pages/Admin/adminBooking";
import AvailabilityCalendar from "./pages/Admin/AvailabilityCalendar";
import CustomerList from "./pages/Admin/Customer";
import Chart from "./pages/Admin/Chart";

// 3. Import Pages - CLIENT
import HomePage from "./pages/Client/HomePage";
import HotelDetailPage from "./pages/Client/HotelDetailPage";
import BookingPage from "./pages/Client/BookingPage";
import BookingHistoryPage from "./pages/Client/BookingHistoryPage";

// 4. Import Pages - AUTH (Đăng nhập/Đăng ký) - MỚI THÊM
// Lưu ý: Bro kiểm tra kỹ đường dẫn file, tôi đang để mặc định là nằm ngay trong folder pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <Routes>
      {/* ================= AUTH ROUTES (Không có Layout) ================= */}
      {/* Đặt ở ngoài cùng để nó chiếm toàn màn hình */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ================= CLIENT ROUTES ================= */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="hotels/:id" element={<HotelDetailPage />} />
        <Route path="client/booking" element={<BookingPage />} />
        <Route path="booking-history" element={<BookingHistoryPage />} />
      </Route>

      {/* ================= ADMIN ROUTES ================= */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="hotels" replace />} />

        {/* Quản lý khách sạn */}
        <Route path="hotels" element={<HotelManagement />} />
        <Route path="hotels/add" element={<AddHotelPage />} />
        <Route path="hotels/edit/:id" element={<EditHotelPage />} />
        <Route path="hotels/detail/:id" element={<DetailHotelPage />} />

        {/* Quản lý loại phòng */}
        <Route path="room-types" element={<RoomTypeManagement />} />
        <Route path="room-types/add/:id" element={<AddRoomTypePage />} />
        <Route path="room-types/edit/:id" element={<EditRoomType />} />
        <Route path="room-types/hotel/:id" element={<RoomTypeManagement />} />

        {/* Quản lý tiện ích */}
        <Route path="amenities" element={<AmenitiesManagement />} />

        {/* Quản lý đặt phòng */}
        <Route path="bookings" element={<AdminBooking />} />

        {/* Quản lý lịch và giá */}
        <Route path="availabilityCalendar" element={<AvailabilityCalendar />} />

        {/* Quản lý khách hàng */}
        <Route path="customers" element={<CustomerList />} />
        {/* Thống kê - Biểu đồ */}
        <Route path="dashboard" element={<Chart />} />
      </Route>
    </Routes>
  );
}

export default App;
