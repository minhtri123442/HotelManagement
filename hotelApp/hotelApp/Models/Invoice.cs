using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Table("Invoice")]
[Index("InvoiceCode", Name = "UQ__Invoice__0D9D7FF38CEC44FD", IsUnique = true)]
public partial class Invoice
{
    [Key]
    [Column("InvoiceID")]
    public int InvoiceId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string InvoiceCode { get; set; } = null!;

    [Column("BookingID")]
    public int BookingId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedDate { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? TotalRoomCharge { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? TotalServiceCharge { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? Discount { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? Tax { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? FinalAmount { get; set; }

    [StringLength(50)]
    public string? PaymentMethod { get; set; }

    [StringLength(20)]
    public string? Status { get; set; }

    [ForeignKey("BookingId")]
    [InverseProperty("Invoices")]
    public virtual Booking Booking { get; set; } = null!;

    [InverseProperty("Invoice")]
    public virtual ICollection<InvoiceDetail> InvoiceDetails { get; set; } = new List<InvoiceDetail>();
}
