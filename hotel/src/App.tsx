import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/mainlayout";
import CustomerManagement from "./pages/frmQLKH";
import EmployeeManagement from "./pages/frmQLNV";
import HotelManagement from "./pages/Frm_DSKS";
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
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
