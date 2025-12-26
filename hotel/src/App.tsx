import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/mainlayout";
import CustomerManagement from "./pages/frmQLKH";
import EmployeeManagement from "./pages/frmQLNV";
import HotelManagement from "./pages/Frm_DSKS";
import AddHotel from "./components/AddHotel";
import AdHotelDetail from "./components/AdminHotelDetail";
import RoomTypeManagemanet from "./pages/Frm_QLRoomType";
import RoomTypeList from "./pages/Frm_QLRoomType";
import RoomTypeAdd from "./components/AddRoomType";
import RoomTypeEdit from "./components/RoomTypeEdit";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout chứa sidebar + nội dung */}
        <Route path="/" element={<Layout />}>
          {/* Trang con */}
          <Route path="customers" element={<CustomerManagement />} />

          {/* Nhân viên */}
          <Route path="employees" element={<EmployeeManagement />} />
          {/* danh sách khách sạn */}
          <Route path="hotelsList" element={<HotelManagement />} />
          <Route path="/hotels/add" element={<AddHotel />} />
          <Route path="/hotels/detail/:id" element={<AdHotelDetail />} />
          <Route path="/roomTypes" element={<RoomTypeList />} />
          <Route path="/RoomTypes/add/:id" element={<RoomTypeAdd />} />
          <Route path="/roomTypes/edit/:id" element={<RoomTypeEdit />} />
          <Route
            path="/roomTypes/hotel/:id"
            element={<RoomTypeManagemanet />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
