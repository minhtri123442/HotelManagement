using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

public partial class HotelImage
{
    [Key]
    [Column("ImageID")]
    public int ImageId { get; set; }

    [Column("HotelID")]
    public int HotelId { get; set; }

    [StringLength(300)]
    public string ImageUrl { get; set; } = null!;

    public bool? IsMain { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("HotelId")]
    [InverseProperty("HotelImages")]
    public virtual Hotel Hotel { get; set; } = null!;
}
