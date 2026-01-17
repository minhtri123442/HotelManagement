using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Index("Slug", Name = "UQ__Hotels__BC7B5FB6323C7B18", IsUnique = true)]
public partial class Hotel
{
    [Key]
    [Column("HotelID")]
    public int HotelId { get; set; }

    [StringLength(200)]
    public string Name { get; set; } = null!;

    [StringLength(250)]
    public string Slug { get; set; } = null!;

    [StringLength(300)]
    public string Address { get; set; } = null!;

    [Column("LocationID")]
    public int LocationId { get; set; }

    public string? Description { get; set; }

    public int? StarRating { get; set; }

    public TimeOnly? CheckInTime { get; set; }

    public TimeOnly? CheckOutTime { get; set; }

    [StringLength(20)]
    public string? Status { get; set; }

    [Column(TypeName = "decimal(9, 6)")]
    public decimal? MapLatitude { get; set; }

    [Column(TypeName = "decimal(9, 6)")]
    public decimal? MapLongitude { get; set; }

    public string? MapUrl { get; set; }

    public DateTime? CreatedAt { get; set; }

    [InverseProperty("Hotel")]
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    [InverseProperty("Hotel")]
    public virtual ICollection<HotelImage> HotelImages { get; set; } = new List<HotelImage>();

    [ForeignKey("LocationId")]
    [InverseProperty("Hotels")]
    public virtual Location Location { get; set; } = null!;

    [InverseProperty("Hotel")]
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    [InverseProperty("Hotel")]
    public virtual ICollection<RoomType> RoomTypes { get; set; } = new List<RoomType>();

    [ForeignKey("HotelId")]
    public ICollection<HotelAmenity> HotelAmenities { get; set; } = new List<HotelAmenity>();
}
