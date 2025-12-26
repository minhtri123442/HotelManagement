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
    }

    public class RoomTypeImageDto
    {
        public int RoomImageID { get; set; }
        public string ImageUrl { get; set; }
        public string? Caption { get; set; }
    }
}