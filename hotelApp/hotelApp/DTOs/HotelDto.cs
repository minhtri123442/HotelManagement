using Microsoft.AspNetCore.Http;

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

        public string? CheckInTime { get; set; }
        public string? CheckOutTime { get; set; }

        public string Status { get; set; } = "Active";
        public decimal? MapLatitude { get; set; }
        public decimal? MapLongitude { get; set; }
        public string? MapUrl { get; set; }
        public DateTime CreatedAt { get; set; }

        // --- ẢNH CHÍNH (1 file) ---
        public IFormFile? ImageFile { get; set; }

        // --- BỔ SUNG: ẢNH PHỤ (Nhiều file) ---
        // Tên biến này phải khớp với tên trong formData.append("GalleryFiles", ...) ở React
        public List<IFormFile>? GalleryFiles { get; set; }

        // Trả về URL khi GET
        public List<string>? ImageUrls { get; set; }
    }

    public class LocationOptionDto
    {
        public int LocationID { get; set; }
        public string LocationName { get; set; }
    }
}