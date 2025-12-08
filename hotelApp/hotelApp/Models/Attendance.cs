using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Table("Attendance")]
[Index("AttendanceCode", Name = "UQ__Attendan__013780A2943C0EC4", IsUnique = true)]
public partial class Attendance
{
    [Key]
    [Column("AttendanceID")]
    public int AttendanceId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string AttendanceCode { get; set; } = null!;

    [Column("EmployeeID")]
    public int EmployeeId { get; set; }

    [Column("ShiftID")]
    public int ShiftId { get; set; }

    public DateOnly WorkDate { get; set; }

    public TimeOnly? CheckIn { get; set; }

    public TimeOnly? CheckOut { get; set; }

    [StringLength(50)]
    public string? Status { get; set; }

    [ForeignKey("EmployeeId")]
    [InverseProperty("Attendances")]
    public virtual Employee Employee { get; set; } = null!;

    [ForeignKey("ShiftId")]
    [InverseProperty("Attendances")]
    public virtual Shift Shift { get; set; } = null!;
}
