using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Table("Promotion")]
[Index("PromotionCode", Name = "UQ__Promotio__A617E4B60209D2D8", IsUnique = true)]
public partial class Promotion
{
    [Key]
    [Column("PromotionID")]
    public int PromotionId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string PromotionCode { get; set; } = null!;

    [StringLength(200)]
    public string? Description { get; set; }

    public int? DiscountPercent { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }
}
