using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Table("Shift")]
[Index("ShiftCode", Name = "UQ__Shift__9377D56268620B32", IsUnique = true)]
public partial class Shift
{
    [Key]
    [Column("ShiftID")]
    public int ShiftId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string ShiftCode { get; set; } = null!;

    [StringLength(50)]
    public string ShiftName { get; set; } = null!;

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    [InverseProperty("Shift")]
    public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
}
