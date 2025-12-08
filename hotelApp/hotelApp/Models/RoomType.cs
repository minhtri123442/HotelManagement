using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Table("RoomType")]
[Index("RoomTypeCode", Name = "UQ__RoomType__F06AB9537DBA19E5", IsUnique = true)]
public partial class RoomType
{
    [Key]
    [Column("RoomTypeID")]
    public int RoomTypeId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string RoomTypeCode { get; set; } = null!;

    [StringLength(100)]
    public string TypeName { get; set; } = null!;

    [StringLength(300)]
    public string? Description { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal PricePerNight { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? PricePerHour { get; set; }

    public int MaxAdult { get; set; }

    public int MaxChild { get; set; }

    [InverseProperty("RoomType")]
    public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();
}
