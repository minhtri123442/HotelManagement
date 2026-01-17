using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace hotelApp.Models
{
    public partial class Amenity
    {
        public int AmenityId { get; set; }

        public string Name { get; set; } = null!;

        public string? IconClass { get; set; }

        public string? Type { get; set; }

        // --- XÓA ĐOẠN CŨ NÀY ĐI (NGUYÊN NHÂN GÂY LỖI) ---
        /*
        [InverseProperty("Amenities")] 
        public virtual ICollection<Hotel> Hotels { get; set; } = new List<Hotel>();
        */

        // --- THÊM ĐOẠN MỚI NÀY VÀO ---
        // Để nối với bảng trung gian
        public virtual ICollection<HotelAmenity> HotelAmenities { get; set; } = new List<HotelAmenity>();

        public virtual ICollection<RoomTypeAmenity> RoomTypeAmenities { get; set; } = new List<RoomTypeAmenity>();
    }
}