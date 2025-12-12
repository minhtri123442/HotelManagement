using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Table("Employee")]
[Index("EmployeeCode", Name = "UQ__Employee__1F6425480AB7CAAF", IsUnique = true)]
[Index("Username", Name = "UQ__Employee__536C85E40F2F7D90", IsUnique = true)]
public partial class Employee
{
    [Key]
    [Column("EmployeeID")]
    public int EmployeeId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string EmployeeCode { get; set; } = null!;

    [StringLength(150)]
    public string FullName { get; set; } = null!;

    [StringLength(20)]
    public string? Phone { get; set; }

    [StringLength(100)]
    public string? Email { get; set; }

    [StringLength(50)]
    public string? Role { get; set; }

    [StringLength(50)]
    public string? Username { get; set; }

    [StringLength(200)]
    public string? PasswordHash { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedDate { get; set; }

    [InverseProperty("Employee")]
    public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();

    [InverseProperty("Employee")]
    public virtual ICollection<CheckHistory> CheckHistories { get; set; } = new List<CheckHistory>();

    [InverseProperty("Employee")]
    public virtual ICollection<Salary> Salaries { get; set; } = new List<Salary>();
}
