using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Index("Code", Name = "UQ__Promotio__A25C5AA7B9A8A6BB", IsUnique = true)]
public partial class Promotion
{
    [Key]
    [Column("PromotionID")]
    public int PromotionId { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string? Code { get; set; }

    [StringLength(20)]
    public string? DiscountType { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? DiscountValue { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public int? MaxUsage { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? MinBookingAmount { get; set; }
}
