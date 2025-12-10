import React, { useState } from "react";
import "../styles/frm_dangnhap.css";
import hotelImg from "../assets/hotenew.jpg";

const FrmDangNhap: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    return (
        <div className={`login-wrapper ${isLogin ? "login-mode" : "register-mode"}`}>
            <div className="login-left">
                <form className="login-form">
                    <h2>{isLogin ? "Đăng Nhập Hệ Thống" : "Tạo Tài Khoản"}</h2>

                    <input
                        type="email"
                        placeholder="Email..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Mật khẩu..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit">
                        {isLogin ? "Đăng nhập" : "Đăng ký"}
                    </button>

                    <p
                        className="switch-btn"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin
                            ? "Chưa có tài khoản? Đăng ký ngay"
                            : "Đã có tài khoản? Đăng nhập"}
                    </p>
                </form>
            </div>

            <div className="login-right">
                <img src={hotelImg} alt="Hotel" />
            </div>
        </div>
    );
};

export default FrmDangNhap;
