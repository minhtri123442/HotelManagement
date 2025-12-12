using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Table("Room")]
[Index("RoomCode", Name = "UQ__Room__4F9D5231ED9E7473", IsUnique = true)]
[Index("RoomNumber", Name = "UQ__Room__AE10E07AD03F64A4", IsUnique = true)]
public partial class Room
{
    [Key]
    [Column("RoomID")]
    public int RoomId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string RoomCode { get; set; } = null!;

    [StringLength(20)]
    public string RoomNumber { get; set; } = null!;

    [Column("HotelID")]
    public int HotelId { get; set; }

    [Column("RoomTypeID")]
    public int RoomTypeId { get; set; }

    public int? Floor { get; set; }

    [StringLength(20)]
    public string Status { get; set; } = null!;

    [StringLength(200)]
    public string? Note { get; set; }

    [StringLength(300)]
    public string ImageUrl { get; set; } = null!;

    [InverseProperty("Room")]
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    [ForeignKey("HotelId")]
    [InverseProperty("Rooms")]
    public virtual Hotel Hotel { get; set; } = null!;

    [InverseProperty("Room")]
    public virtual ICollection<RoomImage> RoomImages { get; set; } = new List<RoomImage>();

    [InverseProperty("Room")]
    public virtual ICollection<RoomMaintenance> RoomMaintenances { get; set; } = new List<RoomMaintenance>();

    [ForeignKey("RoomTypeId")]
    [InverseProperty("Rooms")]
    public virtual RoomType RoomType { get; set; } = null!;
}
