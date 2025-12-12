using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Table("Booking")]
[Index("BookingCode", Name = "UQ__Booking__C6E56BD59161ABDE", IsUnique = true)]
public partial class Booking
{
    [Key]
    [Column("BookingID")]
    public int BookingId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string BookingCode { get; set; } = null!;

    [Column("CustomerID")]
    public int CustomerId { get; set; }

    [Column("RoomID")]
    public int RoomId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CheckInDate { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CheckOutDate { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? BookingDate { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? Deposit { get; set; }

    public int NumberOfAdult { get; set; }

    public int NumberOfChild { get; set; }

    [StringLength(20)]
    public string? Status { get; set; }

    [StringLength(200)]
    public string? Note { get; set; }

    [InverseProperty("Booking")]
    public virtual ICollection<CheckHistory> CheckHistories { get; set; } = new List<CheckHistory>();

    [ForeignKey("CustomerId")]
    [InverseProperty("Bookings")]
    public virtual Customer Customer { get; set; } = null!;

    [InverseProperty("Booking")]
    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    [InverseProperty("Booking")]
    public virtual ICollection<Guest> Guests { get; set; } = new List<Guest>();

    [InverseProperty("Booking")]
    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    [ForeignKey("RoomId")]
    [InverseProperty("Bookings")]
    public virtual Room Room { get; set; } = null!;

    [InverseProperty("Booking")]
    public virtual ICollection<ServiceDetail> ServiceDetails { get; set; } = new List<ServiceDetail>();
}
