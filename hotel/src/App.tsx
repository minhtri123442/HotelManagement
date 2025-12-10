import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import FrmDangNhap from "./pages/frm_dangnhap";
import FrmQLNV from "./pages/frm_QLNV";
import Dashboard from "./components/dashboardtrangchu";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<FrmDangNhap />} />
        <Route path="/qlnv" element={<FrmQLNV />} />

        {/* Trang chủ có menu trái + phòng bên phải */}
       <Route path="/" element={<Dashboard/>} />
      </Routes>
    </Router>
  );
}

export default App;
