using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Table("Guest")]
[Index("GuestCode", Name = "UQ__Guest__58C5F38D477810FB", IsUnique = true)]
public partial class Guest
{
    [Key]
    [Column("GuestID")]
    public int GuestId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string GuestCode { get; set; } = null!;

    [Column("BookingID")]
    public int BookingId { get; set; }

    [StringLength(150)]
    public string? FullName { get; set; }

    [Column("CitizenID")]
    [StringLength(50)]
    public string? CitizenId { get; set; }

    [StringLength(10)]
    public string? Gender { get; set; }

    [ForeignKey("BookingId")]
    [InverseProperty("Guests")]
    public virtual Booking Booking { get; set; } = null!;
}
