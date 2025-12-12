using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

public partial class RoomImage
{
    [Key]
    [Column("ImageID")]
    public int ImageId { get; set; }

    [Column("RoomID")]
    public int RoomId { get; set; }

    [StringLength(300)]
    public string ImageUrl { get; set; } = null!;

    public bool? IsMain { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("RoomId")]
    [InverseProperty("RoomImages")]
    public virtual Room Room { get; set; } = null!;
}
