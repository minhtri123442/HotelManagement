using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Table("SalaryDetail")]
[Index("SalaryDetailCode", Name = "UQ__SalaryDe__AAEE5842F7B67294", IsUnique = true)]
public partial class SalaryDetail
{
    [Key]
    [Column("SalaryDetailID")]
    public int SalaryDetailId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string SalaryDetailCode { get; set; } = null!;

    [Column("SalaryID")]
    public int SalaryId { get; set; }

    [StringLength(200)]
    public string ItemName { get; set; } = null!;

    [Column(TypeName = "decimal(18, 2)")]
    public decimal Amount { get; set; }

    [ForeignKey("SalaryId")]
    [InverseProperty("SalaryDetails")]
    public virtual Salary Salary { get; set; } = null!;
}
