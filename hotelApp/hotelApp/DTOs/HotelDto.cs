namespace hotelApp.DTOs
{
    public class HotelDto
    {
        public int HotelID { get; set; }
        public string HotelCode { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public string? MainImageUrl { get; set; }
        public DateTime? CreatedAt { get; set; }
        public List<string> Images { get; set; }
    }


}
