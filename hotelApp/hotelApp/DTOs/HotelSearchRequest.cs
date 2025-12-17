using System.ComponentModel.DataAnnotations;

namespace hotelApp.DTOs
{
    public class HotelSearchRequest
    {
        public string? Keyword { get; set; } // Tìm theo tên
        public int? LocationID { get; set; } // Tìm theo ID thành phố

        [Required]
        public DateTime CheckInDate { get; set; }

        [Required]
        public DateTime CheckOutDate { get; set; }

        public int Adults { get; set; } = 2;

        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
