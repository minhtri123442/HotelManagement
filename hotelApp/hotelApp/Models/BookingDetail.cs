using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

public partial class BookingDetail
{
    [Key]
    [Column("DetailID")]
    public int DetailId { get; set; }

    [Column("BookingID")]
    public int BookingId { get; set; }

    [Column("RoomTypeID")]
    public int RoomTypeId { get; set; }

    public int? Quantity { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal PricePerNight { get; set; }

    [ForeignKey("BookingId")]
    [InverseProperty("BookingDetails")]
    public virtual Booking Booking { get; set; } = null!;

    [ForeignKey("RoomTypeId")]
    [InverseProperty("BookingDetails")]
    public virtual RoomType RoomType { get; set; } = null!;
}
