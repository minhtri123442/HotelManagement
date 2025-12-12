using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Table("RoomMaintenance")]
[Index("MaintenanceCode", Name = "UQ__RoomMain__16D69749844FE9D6", IsUnique = true)]
public partial class RoomMaintenance
{
    [Key]
    [Column("MaintenanceID")]
    public int MaintenanceId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string MaintenanceCode { get; set; } = null!;

    [Column("RoomID")]
    public int RoomId { get; set; }

    [StringLength(200)]
    public string? Issue { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime StartDate { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? EndDate { get; set; }

    [StringLength(20)]
    public string? Status { get; set; }

    [ForeignKey("RoomId")]
    [InverseProperty("RoomMaintenances")]
    public virtual Room Room { get; set; } = null!;
}
