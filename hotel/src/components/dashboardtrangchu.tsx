import React from "react";
import "../styles/dashboardTC.css";
import { FaHome, FaBed, FaRegCommentDots, FaPhoneAlt, FaUser } from "react-icons/fa";
import HotelHome from "../pages/HotelHome";

const DashboardTrangChu: React.FC = () => {
  return (
    <div className="dashboard-container">

      {/* Sidebar menu cho khách hàng */}
      <div className="sidebar customer-sidebar">
        <h2 className="logo">🏨 HOTEL</h2>
        <ul>
          <li className="active"><FaHome /> Trang chủ</li>
          <li><FaBed /> Phòng</li>
          <li><FaRegCommentDots /> Đánh giá</li>
          <li><FaPhoneAlt /> Liên hệ</li>
          <li><FaUser /> Tài khoản</li>
        </ul>
      </div>

      {/* Nội dung bên phải */}
      <div className="main-content customer-main">
        <HotelHome />
      </div>

    </div>
  );
};

export default DashboardTrangChu;
