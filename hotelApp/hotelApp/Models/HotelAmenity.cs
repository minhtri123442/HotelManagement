namespace hotelApp.Models
{
    public class HotelAmenity
    {
        public int Id { get; set; }

        public int HotelId { get; set; }
        public virtual Hotel Hotel { get; set; } = null!;

        public int AmenityId { get; set; }
        public virtual Amenity Amenity { get; set; } = null!;
    }
}