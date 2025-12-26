using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Index("BookingId", Name = "UQ__Reviews__73951ACCD228CF67", IsUnique = true)]
public partial class Review
{
    [Key]
    [Column("ReviewID")]
    public int ReviewId { get; set; }

    [Column("BookingID")]
    public int BookingId { get; set; }

    [Column("HotelID")]
    public int HotelId { get; set; }

    [Column("UserID")]
    public int UserId { get; set; }

    [Column(TypeName = "decimal(3, 1)")]
    public decimal? Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime? CreatedDate { get; set; }

    public int? CleanlinessScore { get; set; }

    public int? ComfortScore { get; set; }

    public int? StaffScore { get; set; }

    public int? LocationScore { get; set; }

    public int? ValueScore { get; set; }

    [ForeignKey("BookingId")]
    [InverseProperty("Review")]
    public virtual Booking Booking { get; set; } = null!;

    [ForeignKey("HotelId")]
    [InverseProperty("Reviews")]
    public virtual Hotel Hotel { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("Reviews")]
    public virtual User User { get; set; } = null!;
}
