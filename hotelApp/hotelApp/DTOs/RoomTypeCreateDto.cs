using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http; // Bắt buộc để dùng IFormFile

namespace hotelApp.DTOs
{
    public class RoomTypeCreateDto
    {
        [Required]
        public int HotelID { get; set; }

        [Required(ErrorMessage = "Tên không được để trống")]
        public string Name { get; set; }

        public string? Description { get; set; }

        [Required]
        public decimal BasePrice { get; set; }

        public int MaxAdults { get; set; } = 2;
        public int MaxChildren { get; set; } = 1;
        public decimal? RoomArea { get; set; }
        public string? BedType { get; set; }
        public int Quantity { get; set; } = 1;

        // --- PHẦN NHẬN FILE (INPUT) ---

        // Ảnh đại diện (1 file)
        public IFormFile? ThumbnailImage { get; set; }

        // Bộ sưu tập ảnh (Nhiều file)
        public List<IFormFile>? GalleryImages { get; set; }

        public List<int>? AmenityIds { get; set; }
    }
}