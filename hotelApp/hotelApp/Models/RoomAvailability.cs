using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Table("RoomAvailability")]
[Index("RoomTypeId", "Date", Name = "UQ_RoomDate", IsUnique = true)]
public partial class RoomAvailability
{
    [Key]
    [Column("AvailabilityID")]
    public int AvailabilityId { get; set; }

    [Column("RoomTypeID")]
    public int RoomTypeId { get; set; }

    public DateOnly Date { get; set; }

    public int AvailableQty { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal Price { get; set; }

    public bool? IsClosed { get; set; }

    [ForeignKey("RoomTypeId")]
    [InverseProperty("RoomAvailabilities")]
    public virtual RoomType RoomType { get; set; } = null!;
}
