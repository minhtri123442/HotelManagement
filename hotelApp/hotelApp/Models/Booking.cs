using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Index("BookingCode", Name = "UQ__Bookings__C6E56BD5DDE6DA1C", IsUnique = true)]
public partial class Booking
{
    [Key]
    [Column("BookingID")]
    public int BookingId { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string BookingCode { get; set; } = null!;

    [Column("UserID")]
    public int UserId { get; set; }

    [Column("HotelID")]
    public int HotelId { get; set; }

    public DateTime? BookingDate { get; set; }

    public DateOnly CheckInDate { get; set; }

    public DateOnly CheckOutDate { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal TotalAmount { get; set; }

    [StringLength(50)]
    public string? Status { get; set; }

    [StringLength(50)]
    public string? PaymentStatus { get; set; }

    [StringLength(500)]
    public string? SpecialRequest { get; set; }

    [InverseProperty("Booking")]
    public virtual ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();

    [ForeignKey("HotelId")]
    [InverseProperty("Bookings")]
    public virtual Hotel Hotel { get; set; } = null!;

    [InverseProperty("Booking")]
    public virtual Review? Review { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Bookings")]
    public virtual User User { get; set; } = null!;
}
