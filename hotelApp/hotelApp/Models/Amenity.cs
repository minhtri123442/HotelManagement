using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

public partial class Amenity
{
    [Key]
    [Column("AmenityID")]
    public int AmenityId { get; set; }

    [StringLength(100)]
    public string Name { get; set; } = null!;

    [StringLength(100)]
    public string? IconClass { get; set; }

    [StringLength(20)]
    public string? Type { get; set; }

    [ForeignKey("AmenityId")]
    [InverseProperty("Amenities")]
    public virtual ICollection<Hotel> Hotels { get; set; } = new List<Hotel>();

    [ForeignKey("AmenityId")]
    [InverseProperty("Amenities")]
    public virtual ICollection<RoomType> RoomTypes { get; set; } = new List<RoomType>();
}
