
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/mainlayout";
import CustomerManagement from "./pages/frmQLKH";
import EmployeeManagement from "./pages/frmQLNV";
import HotelManagement from "./pages/Frm_DSKS";
import FrmDangNhap from "./pages/frm_dangnhap";
import FrmQLNV from "./pages/frm_QLNV";
import FrmQLRoom from "./pages/frm_QLroom";
import HotelHome from "./pages/HotelHome";
import FrmAddRoom from "./pages/frm_AddRoom";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Layout />}>

          <Route path="customers" element={<CustomerManagement />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="hotelsList" element={<HotelManagement />} />
          <Route path="qlnv" element={<FrmQLNV />} />

          {/* Danh sách phòng */}
          <Route path="rooms" element={<FrmQLRoom />} />

          {/* Thêm phòng */}
          <Route path="rooms/add" element={<FrmAddRoom />} />

        </Route>

        <Route path="/login" element={<FrmDangNhap />} />
        <Route path="/homepage" element={<HotelHome />} />

      </Routes>
    </BrowserRouter>
  );
}

