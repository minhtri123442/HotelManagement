using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Models;

public partial class HotelContext : DbContext
{
    public HotelContext()
    {
    }

    public HotelContext(DbContextOptions<HotelContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Amenity> Amenities { get; set; }

    public virtual DbSet<Booking> Bookings { get; set; }

    public virtual DbSet<BookingDetail> BookingDetails { get; set; }

    public virtual DbSet<Hotel> Hotels { get; set; }

    public virtual DbSet<HotelImage> HotelImages { get; set; }

    public virtual DbSet<Location> Locations { get; set; }

    public virtual DbSet<Promotion> Promotions { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<RoomAvailability> RoomAvailabilities { get; set; }

    public virtual DbSet<RoomType> RoomTypes { get; set; }

    public virtual DbSet<RoomTypeImage> RoomTypeImages { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=.\\SQLEXPRESS;Database=Hotel_Management;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Amenity>(entity =>
        {
            entity.HasKey(e => e.AmenityId).HasName("PK__Amenitie__842AF52B4749149B");
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.BookingId).HasName("PK__Bookings__73951ACD1A8CA07D");

            entity.Property(e => e.BookingDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.PaymentStatus).HasDefaultValue("Unpaid");
            entity.Property(e => e.Status).HasDefaultValue("Confirmed");

            entity.HasOne(d => d.Hotel).WithMany(p => p.Bookings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Bookings__HotelI__656C112C");

            entity.HasOne(d => d.User).WithMany(p => p.Bookings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Bookings__UserID__6477ECF3");
        });

        modelBuilder.Entity<BookingDetail>(entity =>
        {
            entity.HasKey(e => e.DetailId).HasName("PK__BookingD__135C314D76F52AF9");

            entity.Property(e => e.Quantity).HasDefaultValue(1);

            entity.HasOne(d => d.Booking).WithMany(p => p.BookingDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookingDe__Booki__693CA210");

            entity.HasOne(d => d.RoomType).WithMany(p => p.BookingDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookingDe__RoomT__6A30C649");
        });

        modelBuilder.Entity<Hotel>(entity =>
        {
            entity.HasKey(e => e.HotelId).HasName("PK__Hotels__46023BBF95B73A61");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.StarRating).HasDefaultValue(0);
            entity.Property(e => e.Status).HasDefaultValue("Active");

            entity.HasOne(d => d.Location).WithMany(p => p.Hotels)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Hotels__Location__3E52440B");

            entity.HasMany(d => d.Amenities).WithMany(p => p.Hotels)
                .UsingEntity<Dictionary<string, object>>(
                    "HotelAmenity",
                    r => r.HasOne<Amenity>().WithMany()
                        .HasForeignKey("AmenityId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__HotelAmen__Ameni__440B1D61"),
                    l => l.HasOne<Hotel>().WithMany()
                        .HasForeignKey("HotelId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__HotelAmen__Hotel__4316F928"),
                    j =>
                    {
                        j.HasKey("HotelId", "AmenityId").HasName("PK__HotelAme__EE4094EDA83A6999");
                        j.ToTable("HotelAmenities");
                        j.IndexerProperty<int>("HotelId").HasColumnName("HotelID");
                        j.IndexerProperty<int>("AmenityId").HasColumnName("AmenityID");
                    });
        });

        modelBuilder.Entity<HotelImage>(entity =>
        {
            entity.HasKey(e => e.ImageId).HasName("PK__HotelIma__7516F4ECA64EB59E");

            entity.Property(e => e.IsMain).HasDefaultValue(false);

            entity.HasOne(d => d.Hotel).WithMany(p => p.HotelImages).HasConstraintName("FK__HotelImag__Hotel__47DBAE45");
        });

        modelBuilder.Entity<Location>(entity =>
        {
            entity.HasKey(e => e.LocationId).HasName("PK__Location__E7FEA477C269A20A");

            entity.Property(e => e.IsPopular).HasDefaultValue(false);
        });

        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasKey(e => e.PromotionId).HasName("PK__Promotio__52C42F2FA107A462");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.ReviewId).HasName("PK__Reviews__74BC79AE2ED53A73");

            entity.Property(e => e.CreatedDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Booking).WithOne(p => p.Review)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Reviews__Booking__6FE99F9F");

            entity.HasOne(d => d.Hotel).WithMany(p => p.Reviews)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Reviews__HotelID__70DDC3D8");

            entity.HasOne(d => d.User).WithMany(p => p.Reviews)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Reviews__UserID__71D1E811");
        });

        modelBuilder.Entity<RoomAvailability>(entity =>
        {
            entity.HasKey(e => e.AvailabilityId).HasName("PK__RoomAvai__DA397991655A09E3");

            entity.Property(e => e.IsClosed).HasDefaultValue(false);

            entity.HasOne(d => d.RoomType).WithMany(p => p.RoomAvailabilities)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__RoomAvail__RoomT__59063A47");
        });

        modelBuilder.Entity<RoomType>(entity =>
        {
            entity.HasKey(e => e.RoomTypeId).HasName("PK__RoomType__BCC89611B59DA4C6");

            entity.Property(e => e.MaxAdults).HasDefaultValue(2);
            entity.Property(e => e.MaxChildren).HasDefaultValue(1);
            entity.Property(e => e.Quantity).HasDefaultValue(1);

            entity.HasOne(d => d.Hotel).WithMany(p => p.RoomTypes).HasConstraintName("FK__RoomTypes__Hotel__4D94879B");

            entity.HasMany(d => d.Amenities).WithMany(p => p.RoomTypes)
                .UsingEntity<Dictionary<string, object>>(
                    "RoomTypeAmenity",
                    r => r.HasOne<Amenity>().WithMany()
                        .HasForeignKey("AmenityId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__RoomTypeA__Ameni__5441852A"),
                    l => l.HasOne<RoomType>().WithMany()
                        .HasForeignKey("RoomTypeId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__RoomTypeA__RoomT__534D60F1"),
                    j =>
                    {
                        j.HasKey("RoomTypeId", "AmenityId").HasName("PK__RoomType__148A39438166D498");
                        j.ToTable("RoomTypeAmenities");
                        j.IndexerProperty<int>("RoomTypeId").HasColumnName("RoomTypeID");
                        j.IndexerProperty<int>("AmenityId").HasColumnName("AmenityID");
                    });
        });

        modelBuilder.Entity<RoomTypeImage>(entity =>
        {
            entity.HasKey(e => e.RoomImageId).HasName("PK__RoomType__989281C0334DEE01");

            entity.HasOne(d => d.RoomType).WithMany(p => p.RoomTypeImages).HasConstraintName("FK__RoomTypeI__RoomT__5070F446");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCACE01E955D");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Role).HasDefaultValue("Customer");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
