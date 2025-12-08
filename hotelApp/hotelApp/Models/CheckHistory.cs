using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Table("CheckHistory")]
[Index("HistoryCode", Name = "UQ__CheckHis__3304228D020FE304", IsUnique = true)]
public partial class CheckHistory
{
    [Key]
    [Column("HistoryID")]
    public int HistoryId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string HistoryCode { get; set; } = null!;

    [Column("BookingID")]
    public int BookingId { get; set; }

    [StringLength(20)]
    public string? Action { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? ActionDate { get; set; }

    [Column("EmployeeID")]
    public int? EmployeeId { get; set; }

    [ForeignKey("BookingId")]
    [InverseProperty("CheckHistories")]
    public virtual Booking Booking { get; set; } = null!;

    [ForeignKey("EmployeeId")]
    [InverseProperty("CheckHistories")]
    public virtual Employee? Employee { get; set; }
}
