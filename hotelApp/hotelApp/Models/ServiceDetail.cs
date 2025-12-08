using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Table("ServiceDetail")]
[Index("ServiceDetailCode", Name = "UQ__ServiceD__F8063B21C0DF3C06", IsUnique = true)]
public partial class ServiceDetail
{
    [Key]
    [Column("ServiceDetailID")]
    public int ServiceDetailId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string ServiceDetailCode { get; set; } = null!;

    [Column("BookingID")]
    public int BookingId { get; set; }

    [Column("ServiceID")]
    public int ServiceId { get; set; }

    public int Quantity { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal Price { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedDate { get; set; }

    [ForeignKey("BookingId")]
    [InverseProperty("ServiceDetails")]
    public virtual Booking Booking { get; set; } = null!;

    [ForeignKey("ServiceId")]
    [InverseProperty("ServiceDetails")]
    public virtual Service Service { get; set; } = null!;
}
