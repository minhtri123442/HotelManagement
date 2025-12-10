import React, { useState, useEffect } from "react";
import "../styles/HotelHome.css";
import hotenew from "../assets/hotenew.jpg";
import hotel from "../assets/hotel.jpg";

interface Room {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviews: number;
    img: string;
    guests: string;
    bed: string;
    amenities: string[];
    isPromo?: boolean;
    isFeatured?: boolean;
}

const rooms: Room[] = [
    { id: 1, name: "Deluxe King Room", price: 760000, originalPrice: 950000, rating: 9.2, reviews: 128, img: hotenew, guests: "2 khách", bed: "1 giường lớn", amenities: ["Wifi miễn phí", "Máy lạnh", "TV", "Bồn tắm"], isPromo: true },
    { id: 2, name: "Premier Ocean View", price: 1550000, rating: 9.5, reviews: 310, img: hotel, guests: "2 khách", bed: "1 giường đôi", amenities: ["Ban công", "Hồ bơi", "Wifi", "Mini Bar"], isFeatured: true },
    { id: 3, name: "Family Suite", price: 2200000, rating: 8.8, reviews: 205, img: hotenew, guests: "4 khách", bed: "2 giường lớn", amenities: ["Bếp nhỏ", "Máy lạnh", "Wifi", "TV"] },
    { id: 4, name: "Studio Apartment", price: 700000, originalPrice: 800000, rating: 8.5, reviews: 99, img: hotenew, guests: "2 khách", bed: "1 giường đôi", amenities: ["Bếp", "Wifi", "Máy lạnh"], isPromo: true },
    { id: 5, name: "Executive Suite", price: 2800000, rating: 9.4, reviews: 330, img: hotel, guests: "3 khách", bed: "1 giường King", amenities: ["Bồn tắm", "Máy lạnh", "Wifi", "Ban công"], isFeatured: true },
    { id: 6, name: "Luxury Panoramic", price: 3500000, rating: 9.7, reviews: 450, img: hotenew, guests: "2 khách", bed: "1 giường King", amenities: ["Hồ bơi", "View biển", "Mini Bar", "TV"] },
    { id: 7, name: "Superior Double Room", price: 760000, rating: 8.0, reviews: 180, img: hotenew, guests: "2 khách", bed: "1 giường đôi", amenities: ["Wifi", "Máy lạnh", "TV"] },
    { id: 8, name: "Mountain View Room", price: 1200000, rating: 8.7, reviews: 250, img: hotenew, guests: "2 khách", bed: "1 giường lớn", amenities: ["Ban công", "Wifi", "Máy lạnh"] },
    { id: 9, name: "Penthouse Sky Suite", price: 4800000, rating: 9.8, reviews: 512, img: hotenew, guests: "4 khách", bed: "2 giường King", amenities: ["View toàn cảnh", "Hồ bơi riêng", "Mini Bar"], isFeatured: true },
    { id: 10, name: "Budget Single Room", price: 400000, originalPrice: 450000, rating: 7.8, reviews: 90, img: hotenew, guests: "1 khách", bed: "1 giường đơn", amenities: ["Wifi", "Máy lạnh"], isPromo: true },
];

const HotelHome: React.FC = () => {
    const promoRooms = rooms.filter(r => r.isPromo);
    const featuredRooms = rooms.filter(r => r.isFeatured);
    const normalRooms = rooms.filter(r => !r.isPromo && !r.isFeatured);

    const renderRooms = (list: Room[]) => list.map(r => <RoomCard key={r.id} room={r} />);

    // Slider state cho ảnh lớn trên cùng
    const promoImages = promoRooms.map(r => r.img);
    // state
    const [currentSlide, setCurrentSlide] = useState(0);
    const sliderImages = [hotenew, hotel];
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % sliderImages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);





    return (
        <div className="hotel-container">
            <header className="header">
                <h2>🏨 Luxury Hotel Booking</h2>
                <button className="btn-login">Đăng nhập</button>
            </header>

            <div className="filters">
                <select><option>Loại phòng</option></select>
                <select><option>Mức giá</option></select>
                <select><option>Tiện nghi</option></select>
            </div>

            <div className="top-slider">
                {sliderImages.map((img, index) => (
                    <img
                        key={index}
                        src={img}
                        alt="Promo"
                        className={`slider-img ${index === currentSlide ? "active" : ""}`}
                    />
                ))}
            </div>



            {/* SECTION KHUYẾN MÃI */}
            {promoRooms.length > 0 && (
                <section className="section-promo">
                    <h2>🔥 Khuyến mãi</h2>
                    <div className="room-list">{renderRooms(promoRooms)}</div>
                </section>
            )}

            {featuredRooms.length > 0 && (
                <section className="section-featured">
                    <h2>⭐ Phòng nổi bật</h2>
                    <div className="room-list">{renderRooms(featuredRooms)}</div>
                </section>
            )}

            {normalRooms.length > 0 && (
                <section className="section-normal">
                    <h2>Phòng khác</h2>
                    <div className="room-list">{renderRooms(normalRooms)}</div>
                </section>
            )}
        </div>
    );
};

const RoomCard: React.FC<{ room: Room }> = ({ room }) => (
    <div className="room-card">
        <div className="img-wrapper">
            <img src={room.img} alt={room.name} className="room-img" />
            {room.isPromo && <span className="badge promo">Khuyến mãi</span>}
            {room.isFeatured && <span className="badge featured">Nổi bật</span>}
        </div>
        <div className="room-info">
            <h3>{room.name}</h3>
            <div className="rating">⭐ {room.rating} <span>({room.reviews} đánh giá)</span></div>
            <p>{room.guests} • {room.bed}</p>
            <div className="amenities">{room.amenities.map((a, i) => <span key={i}>{a}</span>)}</div>
            <div className="price-row">
                {room.originalPrice ? (
                    <>
                        <p className="original-price">{room.originalPrice.toLocaleString()}đ</p>
                        <p className="price">{room.price.toLocaleString()}đ / đêm</p>
                    </>
                ) : (
                    <p className="price">{room.price.toLocaleString()}đ / đêm</p>
                )}
                <button className="book-btn">Đặt ngay</button>
            </div>
        </div>
    </div>
);

export default HotelHome;
