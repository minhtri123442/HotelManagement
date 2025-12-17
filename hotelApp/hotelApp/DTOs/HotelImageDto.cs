using hotelApp.Models;

namespace hotelApp.DTOs
{
    public class HotelImageDto
    {
        public int ImageID { get; set; }
        public int HotelID { get; set; }
        public string ImageUrl { get; set; }
        public bool? IsMain { get; set; } 

    }
}
