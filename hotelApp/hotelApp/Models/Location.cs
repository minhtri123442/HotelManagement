using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

public partial class Location
{
    [Key]
    [Column("LocationID")]
    public int LocationId { get; set; }

    [StringLength(100)]
    public string LocationName { get; set; } = null!;

    [Column("ParentLocationID")]
    public int? ParentLocationId { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    public bool? IsPopular { get; set; }

    [InverseProperty("Location")]
    public virtual ICollection<Hotel> Hotels { get; set; } = new List<Hotel>();
}
