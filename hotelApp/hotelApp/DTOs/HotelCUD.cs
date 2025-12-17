using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http; // Cần cái này cho IFormFile

namespace hotelApp.DTOs
{
    public class HotelCUD
    {
    }

    // DTO dùng khi tạo mới
    public class HotelCreateDto
    {
        [Required(ErrorMessage = "Tên khách sạn là bắt buộc")]
        public string Name { get; set; } = null!;

        [Required]
        public string Slug { get; set; } = null!;

        [Required]
        public string Address { get; set; } = null!;
        public int LocationID { get; set; }
        public string? Description { get; set; }
        public int StarRating { get; set; }

        public string? MapUrl { get; set; } 

        public string? CheckInTime { get; set; } // React gửi string "14:00"
        public string? CheckOutTime { get; set; } // React gửi string "12:00"

        public decimal? MapLatitude { get; set; }
        public decimal? MapLongitude { get; set; }

        public IFormFile? ImageFile { get; set; }
    }

    // DTO dùng khi cập nhật
    public class HotelUpdateDto : HotelCreateDto
    {
        public string Status { get; set; } = "Active";
    }
}