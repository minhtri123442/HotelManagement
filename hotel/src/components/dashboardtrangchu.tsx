import "../styles/dashboardTC.css";
import { FaHome, FaBed, FaRegCommentDots, FaPhoneAlt, FaUser } from "react-icons/fa";
import HotelHome from "./homepage";
import hotenew from "../assets/hotenew.jpg";
import hotel from "../assets/hotel.jpg";
import React, { useEffect, useState } from "react";


const DashboardTrangChu: React.FC = () => {
   const sliderImages = [hotenew, hotel];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
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
      <div className="main-content customer-main"><var>      
      {/* HEADER */}
      <header className="mb-2 flex justify-between items-center px-10 py-6">
        <h2 className="text-3xl  font-bold text-blue-600">🏨 Luxury Hotel Booking</h2>
        <button className="px-6 py-2 w-[150px]  rounded bg-blue-600 text-white hover:bg-blue-700">
          Đăng nhập
        </button>
      </header></var>
              {/* BANNER SLIDER */}
      <div className="relative w-[92%] mx-auto h-[420px] rounded-xl overflow-hidden shadow-lg mb-10 top-slider">
        {sliderImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="Banner"
            className={`slider-img ${index === currentSlide ? "active" : ""}`}
          />
        ))}
      </div>     
        <HotelHome />
      </div>

    </div>
  );
};

export default DashboardTrangChu;
