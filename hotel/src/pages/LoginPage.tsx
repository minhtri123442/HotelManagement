import React, { useState } from "react";
// 1. IMPORT useLocation
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

// URL ảnh background
const BG_IMAGE = `https://res.cloudinary.com/diun4jee3/image/upload/v1767629256/loginPage_jhpfqs.avif`;

export default function LoginPage() {
  const navigate = useNavigate();
  // 2. KHAI BÁO LOCATION để nhận state từ trang HotelDetail
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5134/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Email hoặc mật khẩu không đúng.");
      }

      const user = await res.json();

      // --- DEBUG QUAN TRỌNG: Kiểm tra xem BE trả về cái gì ---
      console.log("User Data from API:", user);
      // Kiểm tra xem nó là user.role hay user.Role (viết hoa/thường)

      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("storage"));

      // --- LOGIC ĐIỀU HƯỚNG ĐÃ SỬA ---
      // Lưu ý: Kiểm tra kỹ chữ "Admin" hay "admin" tùy vào Database của bạn
      if (user.role === "Admin" || user.role === "admin") {
        // SỬA: Dẫn về /admin (nó sẽ tự redirect vào hotels) hoặc /admin/hotels
        navigate("/admin/hotels");
      } else {
        // Logic cho khách hàng: Quay lại trang trước hoặc về trang chủ
        const from = location.state?.from || "/";
        navigate(from);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 h-screen w-screen flex items-center justify-center bg-gray-100 font-sans z-50 overflow-x-hidden">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row w-[95%] max-w-5xl min-h-[600px] border border-gray-100 relative">
        {/* LEFT SIDE: IMAGE */}
        <div className="hidden md:block md:w-1/2 relative">
          <img
            src={BG_IMAGE}
            className="w-full h-full object-cover"
            alt="Background"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/90 to-transparent mix-blend-multiply"></div>
          <div className="absolute bottom-12 left-10 right-10 z-10 text-white">
            <h3 className="text-3xl font-bold mb-3">Chào mừng bạn quay lại</h3>
            <p className="text-blue-100 opacity-90 leading-relaxed text-lg">
              Hãy đăng nhập để tiếp tục quản lý các đặt phòng và khám phá những
              ưu đãi dành riêng cho bạn.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center relative bg-white p-8 md:p-16">
          <Link
            to="/"
            className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-all group"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">
              Trang chủ
            </span>
          </Link>

          <div className="w-full max-w-sm">
            <h2 className="text-4xl font-black text-gray-900 mb-2">
              Đăng nhập
            </h2>
            <p className="text-gray-400 mb-10 font-bold">
              Vui lòng nhập thông tin của bạn
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 px-5 py-3 rounded-2xl mb-6 text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    required
                    type="email"
                    placeholder="abc@gmail.com"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all bg-gray-50/50"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-gray-700">
                    Mật khẩu
                  </label>
                  <a
                    href="#"
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all bg-gray-50/50"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-[0.98] disabled:bg-gray-300 flex items-center justify-center gap-3 text-lg"
              >
                {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-gray-500 font-bold">
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-4"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
