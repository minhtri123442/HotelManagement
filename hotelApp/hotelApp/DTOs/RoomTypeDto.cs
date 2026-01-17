namespace hotelApp.DTOs
{
    public class RoomTypeDto
    {
        public int RoomTypeID { get; set; }
        public int HotelID { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public int MaxAdults { get; set; }
        public int MaxChildren { get; set; }
        public decimal? RoomArea { get; set; }
        public string? BedType { get; set; }
        public int Quantity { get; set; }

        // Output chỉ trả về đường dẫn ảnh (String)
        public string? ThumbnailUrl { get; set; }
        public List<RoomTypeImageDto> RoomTypeImages { get; set; }
        // Trả về list ID để FE dễ xử lý tick checkbox
        public List<int> AmenityIds { get; set; } = new List<int>();

        // Trả về list Object nếu muốn hiện tên/icon ngay
        public List<AmenityDto> Amenities { get; set; } = new List<AmenityDto>();
    }

    public class RoomTypeImageDto
    {
        public int RoomImageID { get; set; }
        public string ImageUrl { get; set; }
        public string? Caption { get; set; }
    }
}