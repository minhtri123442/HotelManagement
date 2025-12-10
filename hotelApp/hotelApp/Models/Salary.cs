using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Table("Salary")]
[Index("SalaryCode", Name = "UQ__Salary__BDADA4B4A72F654A", IsUnique = true)]
public partial class Salary
{
    [Key]
    [Column("SalaryID")]
    public int SalaryId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string SalaryCode { get; set; } = null!;

    [Column("EmployeeID")]
    public int EmployeeId { get; set; }

    public int Month { get; set; }

    public int Year { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal BaseSalary { get; set; }

    public int? WorkingDays { get; set; }

    [Column("OTHours")]
    public int? Othours { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? Bonus { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? Penalty { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal TotalSalary { get; set; }

    [ForeignKey("EmployeeId")]
    [InverseProperty("Salaries")]
    public virtual Employee Employee { get; set; } = null!;

    [InverseProperty("Salary")]
    public virtual ICollection<SalaryDetail> SalaryDetails { get; set; } = new List<SalaryDetail>();
}
