
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/mainlayout";
import CustomerManagement from "./pages/frmQLKH";
import EmployeeManagement from "./pages/frmQLNV";
import HotelManagement from "./pages/Frm_DSKS";
import FrmDangNhap from "./pages/frm_dangnhap";
import FrmQLNV from "./pages/frm_QLNV";
import Dashboard from "./components/dashboardtrangchu";
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
          <Route path="hotelsList" element={<HotelManagement/>}/>
          <Route path="/login" element={<FrmDangNhap />} />
        <Route path="/qlnv" element={<FrmQLNV />} />

        {/* Trang chủ có menu trái + phòng bên phải */}
       <Route path="/homepage" element={<Dashboard/>} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

