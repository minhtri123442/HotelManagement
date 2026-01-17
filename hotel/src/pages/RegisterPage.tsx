import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  ArrowRightIcon,
  BuildingOffice2Icon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

// --- CẤU HÌNH ẢNH CLOUDINARY ---
const CLOUD_NAME = "diun4jee3";
const BG_IMAGE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/q_auto,f_jpg/v1767629255/RegisterPage_p9lesc.jpg`;

export default function RegisterPage() {
  const navigate = useNavigate();

  // --- STATE ---
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5134/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Đăng ký thất bại");
      }

      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err: any) {
      setError(
        err.message.includes("Email")
          ? "Email này đã được sử dụng."
          : "Đã có lỗi xảy ra."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Sử dụng fixed inset-0 để căn giữa tuyệt đối và triệt tiêu khoảng trắng bên phải */
    <div className="fixed inset-0 h-screen w-screen flex items-center justify-center bg-gray-100 font-sans z-50 overflow-x-hidden p-4">
      {/* Khung Card chính */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row w-[95%] max-w-5xl min-h-[650px] border border-gray-100 relative">
        {/* LEFT SIDE: IMAGE */}
        <div className="hidden md:block md:w-1/2 relative">
          <img
            src={BG_IMAGE}
            alt="Register Background"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent mix-blend-multiply"></div>

          <div className="absolute z-20 top-0 left-0 p-10 text-white h-full flex flex-col justify-between">
            <div className="mb-10">
              <h2 className="text-4xl font-black mb-4 leading-tight drop-shadow-sm">
                Bắt đầu chuyến đi mơ ước.
              </h2>
              <p className="text-blue-100 text-lg font-bold opacity-90">
                Tạo tài khoản để nhận ưu đãi độc quyền và quản lý đặt phòng dễ
                dàng hơn.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center relative bg-white overflow-y-auto">
          {/* Nút Quay lại trang chủ */}
          <Link
            to="/"
            className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-all group"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">
              Trang chủ
            </span>
          </Link>

          <div className="w-full max-w-sm mx-auto">
            <h2 className="text-4xl font-black text-gray-900 mb-2">
              Tạo tài khoản
            </h2>
            <p className="text-gray-400 mb-8 font-bold">
              Điền thông tin bên dưới để đăng ký
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 px-5 py-3 rounded-2xl mb-6 text-sm font-bold border border-red-100">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Họ tên */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  required
                  name="fullName"
                  type="text"
                  placeholder="Họ và tên"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all bg-gray-50/50"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all bg-gray-50/50"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="phoneNumber"
                  type="text"
                  placeholder="Số điện thoại"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all bg-gray-50/50"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  required
                  name="password"
                  type="password"
                  placeholder="Mật khẩu (6+ ký tự)"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all bg-gray-50/50"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  required
                  name="confirmPassword"
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all bg-gray-50/50"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-[0.98] disabled:bg-gray-300 flex items-center justify-center gap-3 text-lg mt-2"
              >
                {loading ? "Đang xử lý..." : "Đăng ký ngay"}
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              <p className="text-gray-500 font-bold">
                Bạn đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-4"
                >
                  Đăng nhập tại đây
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
