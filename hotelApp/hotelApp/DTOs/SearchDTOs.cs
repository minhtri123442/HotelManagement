namespace hotelApp.DTOs
{
    public class SearchRequestDto
    {
        public string? Keyword { get; set; }
        public DateOnly CheckIn { get; set; }
        public DateOnly CheckOut { get; set; }
        public int Adults { get; set; } = 1;
        public int Children { get; set; } = 0;
        public int Rooms { get; set; } = 1;
    }

    public class HotelSearchResultDto
    {
        public int HotelID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public double StarRating { get; set; }
        public string? ImageUrl { get; set; } // Ảnh đại diện
        public decimal MinPrice { get; set; } // Giá thấp nhất tìm được trong khoảng ngày
        public bool IsAvailable { get; set; }
    }
}