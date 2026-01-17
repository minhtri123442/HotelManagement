using hotelApp.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace hotelApp.Data
{
    public static class DbInitializer
    {
        public static void Initialize(HotelContext context)
        {
            // 1. Đảm bảo database đã được tạo
            context.Database.Migrate();

            // 2. Gọi các hàm seed dữ liệu theo thứ tự
            SeedUsers(context);
            SeedLocations(context);
            SeedAmenities(context); // <--- MỚI THÊM: Hàm tạo tiện ích
        }

        private static void SeedUsers(HotelContext context)
        {
            // Kiểm tra xem đã có Admin chưa
            if (context.Users.Any(u => u.Role == "Admin"))
            {
                return;
            }

            var admin = new User
            {
                FullName = "Admin Quản Trị",
                Email = "admin@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                PhoneNumber = "0868399718",
                Role = "Admin",
                CreatedAt = DateTime.Now
            };

            context.Users.Add(admin);
            context.SaveChanges();
        }

        private static void SeedLocations(HotelContext context)
        {
            if (context.Locations.Any())
            {
                return;
            }

            var locations = new List<Location>
            {
                new Location { LocationName = "TP. Hồ Chí Minh", IsPopular = true, ImageUrl = "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1000&auto=format&fit=crop" },
                new Location { LocationName = "Hà Nội", IsPopular = true, ImageUrl = "https://images.unsplash.com/photo-1599593252118-28956eb4e83c?q=80&w=1000&auto=format&fit=crop" },
                new Location { LocationName = "Đà Nẵng", IsPopular = true, ImageUrl = "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1000&auto=format&fit=crop" },
                new Location { LocationName = "Đà Lạt", IsPopular = true, ImageUrl = "https://images.unsplash.com/photo-1626017279328-98e8749449f8?q=80&w=1000&auto=format&fit=crop" },
                new Location { LocationName = "Nha Trang", IsPopular = true, ImageUrl = "https://images.unsplash.com/photo-1565597950319-58356396e5b4?q=80&w=1000&auto=format&fit=crop" },
                new Location { LocationName = "Phú Quốc", IsPopular = true, ImageUrl = "https://images.unsplash.com/photo-1579782522789-98242a8b9f71?q=80&w=1000&auto=format&fit=crop" },
                new Location { LocationName = "Hội An", IsPopular = true, ImageUrl = "https://images.unsplash.com/photo-1557750255-c76072a7bb56?q=80&w=1000&auto=format&fit=crop" },
                new Location { LocationName = "Sapa", IsPopular = true, ImageUrl = "https://images.unsplash.com/photo-1554466904-45307b2756d8?q=80&w=1000&auto=format&fit=crop" },
                new Location { LocationName = "Hạ Long", IsPopular = true, ImageUrl = "https://images.unsplash.com/photo-1552550186-b4d081c70652?q=80&w=1000&auto=format&fit=crop" },
                new Location { LocationName = "Vũng Tàu", IsPopular = false, ImageUrl = "https://images.unsplash.com/photo-1623596716260-262174f8846c?q=80&w=1000&auto=format&fit=crop" }
            };

            context.Locations.AddRange(locations);
            context.SaveChanges();
        }

        // --- ĐÂY LÀ HÀM MỚI ĐỂ TẠO AMENITIES ---
        private static void SeedAmenities(HotelContext context)
        {
            // Kiểm tra nếu bảng Amenities đã có dữ liệu thì không thêm nữa
            if (context.Amenities.Any())
            {
                return;
            }

            var amenities = new List<Amenity>
            {
                // Tiện ích PHÒNG (Room)
                new Amenity { Name = "Wifi miễn phí", IconClass = "wifi", Type = "Room" },
                new Amenity { Name = "Máy lạnh", IconClass = "air-conditioner", Type = "Room" }, // iconClass tạm gọi là air-conditioner, FE sẽ map lại
                new Amenity { Name = "Tivi màn hình phẳng", IconClass = "tv", Type = "Room" },
                new Amenity { Name = "Máy sấy tóc", IconClass = "hair-dryer", Type = "Room" },
                new Amenity { Name = "Tủ lạnh mini", IconClass = "fridge", Type = "Room" },
                new Amenity { Name = "Bồn tắm nóng", IconClass = "hot-tub", Type = "Room" },
                new Amenity { Name = "Két sắt an toàn", IconClass = "safe", Type = "Room" },

                // Tiện ích KHÁCH SẠN (Hotel)
                new Amenity { Name = "Hồ bơi vô cực", IconClass = "swimming-pool", Type = "Hotel" },
                new Amenity { Name = "Phòng Gym", IconClass = "gym", Type = "Hotel" },
                new Amenity { Name = "Bãi đậu xe miễn phí", IconClass = "parking", Type = "Hotel" },
                new Amenity { Name = "Nhà hàng", IconClass = "restaurant", Type = "Hotel" },
                new Amenity { Name = "Quầy Bar", IconClass = "bar", Type = "Hotel" },
                new Amenity { Name = "Lễ tân 24/7", IconClass = "reception", Type = "Hotel" },
                new Amenity { Name = "Dịch vụ Spa", IconClass = "spa", Type = "Hotel" }
            };

            context.Amenities.AddRange(amenities);
            context.SaveChanges();
        }
    }
}