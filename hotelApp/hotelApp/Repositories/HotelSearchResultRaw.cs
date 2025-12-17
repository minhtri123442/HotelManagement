namespace hotelApp.Repositories // Hoặc namespace DTOs
{
    // Class này phải khớp 100% tên cột trong câu SELECT của Stored Procedure
    public class HotelSearchResultRaw
    {
        public int HotelID { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
        public string Address { get; set; }
        public int LocationID { get; set; }
        public string Description { get; set; }
        public int StarRating { get; set; }
        public decimal? MapLatitude { get; set; }
        public decimal? MapLongitude { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? MainImage { get; set; }   // Ảnh đại diện trả về từ SQL
        public decimal StartingPrice { get; set; } // Giá thấp nhất tìm được
        public int TotalCount { get; set; }      // Tổng số bản ghi (để phân trang)
    }
}