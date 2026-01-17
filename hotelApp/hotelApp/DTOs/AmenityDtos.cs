using System.ComponentModel.DataAnnotations;

namespace hotelApp.DTOs
{
    public class AmenityDto
    {
        public int AmenityId { get; set; } // Dùng cho Update, Create thì có thể null

        [Required(ErrorMessage = "Tên tiện ích không được để trống")]
        [StringLength(100)]
        public string Name { get; set; } = null!;

        [StringLength(100)]
        public string? IconClass { get; set; } // Ví dụ: "wifi", "tv", "pool"

        [StringLength(20)]
        public string? Type { get; set; } // Ví dụ: "Room", "Hotel"
                                          // Thêm dòng này:
    }
}
