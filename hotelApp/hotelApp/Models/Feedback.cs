using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Table("Feedback")]
[Index("FeedbackCode", Name = "UQ__Feedback__BCE37B66675B40C6", IsUnique = true)]
public partial class Feedback
{
    [Key]
    [Column("FeedbackID")]
    public int FeedbackId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string FeedbackCode { get; set; } = null!;

    [Column("CustomerID")]
    public int? CustomerId { get; set; }

    [Column("BookingID")]
    public int? BookingId { get; set; }

    public int? Rating { get; set; }

    [StringLength(500)]
    public string? Comment { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedDate { get; set; }

    [ForeignKey("BookingId")]
    [InverseProperty("Feedbacks")]
    public virtual Booking? Booking { get; set; }

    [ForeignKey("CustomerId")]
    [InverseProperty("Feedbacks")]
    public virtual Customer? Customer { get; set; }
}
