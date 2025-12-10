using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

[Table("Service")]
[Index("ServiceCode", Name = "UQ__Service__A01D74C983B96DE2", IsUnique = true)]
public partial class Service
{
    [Key]
    [Column("ServiceID")]
    public int ServiceId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string ServiceCode { get; set; } = null!;

    [StringLength(150)]
    public string ServiceName { get; set; } = null!;

    [Column(TypeName = "decimal(18, 2)")]
    public decimal Price { get; set; }

    [StringLength(50)]
    public string? Unit { get; set; }

    [StringLength(200)]
    public string? Description { get; set; }

    [InverseProperty("Service")]
    public virtual ICollection<ServiceDetail> ServiceDetails { get; set; } = new List<ServiceDetail>();
}
