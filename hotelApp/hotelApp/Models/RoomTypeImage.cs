using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

public partial class RoomTypeImage
{
    [Key]
    [Column("RoomImageID")]
    public int RoomImageId { get; set; }

    [Column("RoomTypeID")]
    public int RoomTypeId { get; set; }

    [StringLength(500)]
    public string ImageUrl { get; set; } = null!;

    [StringLength(100)]
    public string? Caption { get; set; }

    [ForeignKey("RoomTypeId")]
    [InverseProperty("RoomTypeImages")]
    public virtual RoomType RoomType { get; set; } = null!;
}
