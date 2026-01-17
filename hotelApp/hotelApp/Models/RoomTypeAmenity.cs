namespace hotelApp.Models
{
    public class RoomTypeAmenity
    {
        public int Id { get; set; }

        public int RoomTypeId { get; set; }
        public virtual RoomType RoomType { get; set; } = null!;

        public int AmenityId { get; set; }
        public virtual Amenity Amenity { get; set; } = null!;
    }
}