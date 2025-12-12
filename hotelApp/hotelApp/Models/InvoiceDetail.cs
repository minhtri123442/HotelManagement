using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Table("InvoiceDetail")]
[Index("InvoiceDetailCode", Name = "UQ__InvoiceD__3F1D23DB564E4B74", IsUnique = true)]
public partial class InvoiceDetail
{
    [Key]
    [Column("InvoiceDetailID")]
    public int InvoiceDetailId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string InvoiceDetailCode { get; set; } = null!;

    [Column("InvoiceID")]
    public int InvoiceId { get; set; }

    [StringLength(200)]
    public string ItemName { get; set; } = null!;

    public int? Quantity { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal UnitPrice { get; set; }

    [Column(TypeName = "decimal(29, 2)")]
    public decimal? SubTotal { get; set; }

    [ForeignKey("InvoiceId")]
    [InverseProperty("InvoiceDetails")]
    public virtual Invoice Invoice { get; set; } = null!;
}
