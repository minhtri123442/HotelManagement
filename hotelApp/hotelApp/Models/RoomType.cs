using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

public partial class RoomType
{
    [Key]
    [Column("RoomTypeID")]
    public int RoomTypeId { get; set; }

    [Column("HotelID")]
    public int HotelId { get; set; }

    [StringLength(100)]
    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal BasePrice { get; set; }

    public int? MaxAdults { get; set; }

    public int? MaxChildren { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal? RoomArea { get; set; }

    [StringLength(100)]
    public string? BedType { get; set; }

    public int? Quantity { get; set; }

    [StringLength(500)]
    public string? ThumbnailUrl { get; set; }

    [InverseProperty("RoomType")]
    public virtual ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();

    [ForeignKey("HotelId")]
    [InverseProperty("RoomTypes")]
    public virtual Hotel Hotel { get; set; } = null!;

    [InverseProperty("RoomType")]
    public virtual ICollection<RoomAvailability> RoomAvailabilities { get; set; } = new List<RoomAvailability>();

    [InverseProperty("RoomType")]
    public virtual ICollection<RoomTypeImage> RoomTypeImages { get; set; } = new List<RoomTypeImage>();

    public virtual ICollection<RoomTypeAmenity> RoomTypeAmenities { get; set; } = new List<RoomTypeAmenity>();
}
