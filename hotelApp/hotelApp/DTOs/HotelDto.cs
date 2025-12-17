using Microsoft.AspNetCore.Http; // Cần thiết cho IFormFile

namespace hotelApp.DTOs
{
    public class HotelDto
    {
        public int HotelID { get; set; }
        public string Name { get; set; } = null!;
        public string Slug { get; set; } = null!;
        public string Address { get; set; } = null!;
        public int LocationID { get; set; }
        public string? Description { get; set; }
        public int StarRating { get; set; }

        // Dùng chuỗi để nhận từ Form React ("14:00"), sau đó Controller sẽ Parse sang TimeOnly
        // Lý do: [FromForm] đôi khi bind lỗi trực tiếp sang TimeOnly nếu format không chuẩn
        public string? CheckInTime { get; set; }
        public string? CheckOutTime { get; set; }

        public string Status { get; set; } = "Active";
        public decimal? MapLatitude { get; set; }
        public decimal? MapLongitude { get; set; }
        public string? MapUrl { get; set; }
        public DateTime CreatedAt { get; set; }

        // Nhận file ảnh từ React (FormData)
        public IFormFile? ImageFile { get; set; }

        // Trả về đường dẫn ảnh cho Client (khi GET)
        public List<string>? ImageUrls { get; set; }
    }

    // Tạo thêm DTO nhỏ gọn cho Location Dropdown
    public class LocationOptionDto
    {
        public int LocationID { get; set; }
        public string LocationName { get; set; }
    }
}