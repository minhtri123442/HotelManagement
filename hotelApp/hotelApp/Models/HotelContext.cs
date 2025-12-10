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

    public virtual DbSet<Attendance> Attendances { get; set; }

    public virtual DbSet<Booking> Bookings { get; set; }

    public virtual DbSet<CheckHistory> CheckHistories { get; set; }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<Employee> Employees { get; set; }

    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<Guest> Guests { get; set; }

    public virtual DbSet<Hotel> Hotels { get; set; }

    public virtual DbSet<HotelImage> HotelImages { get; set; }

    public virtual DbSet<Invoice> Invoices { get; set; }

    public virtual DbSet<InvoiceDetail> InvoiceDetails { get; set; }

    public virtual DbSet<Promotion> Promotions { get; set; }

    public virtual DbSet<Room> Rooms { get; set; }

    public virtual DbSet<RoomMaintenance> RoomMaintenances { get; set; }

    public virtual DbSet<RoomType> RoomTypes { get; set; }

    public virtual DbSet<Salary> Salaries { get; set; }

    public virtual DbSet<SalaryDetail> SalaryDetails { get; set; }

    public virtual DbSet<Service> Services { get; set; }

    public virtual DbSet<ServiceDetail> ServiceDetails { get; set; }

    public virtual DbSet<Shift> Shifts { get; set; }

    //    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    //#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
    //        => optionsBuilder.UseSqlServer("Server=.\\SQLEXPRESS;Database=Hotel_Management;Trusted_Connection=True;TrustServerCertificate=True;");
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
            => optionsBuilder.UseSqlServer("Server=.;Database=Hotel_Management;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.HasKey(e => e.AttendanceId).HasName("PK__Attendan__8B69263C5B2293E5");

            entity.Property(e => e.Status).HasDefaultValue("Có mặt");

            entity.HasOne(d => d.Employee).WithMany(p => p.Attendances)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Attendanc__Emplo__01142BA1");

            entity.HasOne(d => d.Shift).WithMany(p => p.Attendances)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Attendanc__Shift__02084FDA");
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.BookingId).HasName("PK__Booking__73951ACD22DFB0CD");

            entity.Property(e => e.BookingDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Deposit).HasDefaultValue(0m);
            entity.Property(e => e.Status).HasDefaultValue("Booked");

            entity.HasOne(d => d.Customer).WithMany(p => p.Bookings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Booking__Custome__5AEE82B9");

            entity.HasOne(d => d.Room).WithMany(p => p.Bookings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Booking__RoomID__5BE2A6F2");
        });

        modelBuilder.Entity<CheckHistory>(entity =>
        {
            entity.HasKey(e => e.HistoryId).HasName("PK__CheckHis__4D7B4ADDC3CC1F3F");

            entity.Property(e => e.ActionDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Booking).WithMany(p => p.CheckHistories)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CheckHist__Booki__787EE5A0");

            entity.HasOne(d => d.Employee).WithMany(p => p.CheckHistories).HasConstraintName("FK__CheckHist__Emplo__797309D9");
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.CustomerId).HasName("PK__Customer__A4AE64B8CB946CF7");

            entity.Property(e => e.CreatedDate).HasDefaultValueSql("(getdate())");
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.EmployeeId).HasName("PK__Employee__7AD04FF10505D1D3");

            entity.Property(e => e.CreatedDate).HasDefaultValueSql("(getdate())");
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__Feedback__6A4BEDF682B4EC69");

            entity.Property(e => e.CreatedDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Booking).WithMany(p => p.Feedbacks).HasConstraintName("FK__Feedback__Bookin__14270015");

            entity.HasOne(d => d.Customer).WithMany(p => p.Feedbacks).HasConstraintName("FK__Feedback__Custom__1332DBDC");
        });

        modelBuilder.Entity<Guest>(entity =>
        {
            entity.HasKey(e => e.GuestId).HasName("PK__Guest__0C423C3291F253FB");

            entity.HasOne(d => d.Booking).WithMany(p => p.Guests)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Guest__BookingID__1AD3FDA4");
        });

        modelBuilder.Entity<Hotel>(entity =>
        {
            entity.HasKey(e => e.HotelId).HasName("PK__Hotel__46023BBFC6103A08");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Status).HasDefaultValue("Active");
        });

        modelBuilder.Entity<HotelImage>(entity =>
        {
            entity.HasKey(e => e.ImageId).HasName("PK__HotelIma__7516F4EC5C02EC24");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsMain).HasDefaultValue(false);

            entity.HasOne(d => d.Hotel).WithMany(p => p.HotelImages).HasConstraintName("FK__HotelImag__Hotel__3F466844");
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.InvoiceId).HasName("PK__Invoice__D796AAD5E41E8628");

            entity.Property(e => e.CreatedDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Discount).HasDefaultValue(0m);
            entity.Property(e => e.FinalAmount).HasDefaultValue(0m);
            entity.Property(e => e.Status).HasDefaultValue("Unpaid");
            entity.Property(e => e.Tax).HasDefaultValue(0m);
            entity.Property(e => e.TotalRoomCharge).HasDefaultValue(0m);
            entity.Property(e => e.TotalServiceCharge).HasDefaultValue(0m);

            entity.HasOne(d => d.Booking).WithMany(p => p.Invoices)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Invoice__Booking__6EF57B66");
        });

        modelBuilder.Entity<InvoiceDetail>(entity =>
        {
            entity.HasKey(e => e.InvoiceDetailId).HasName("PK__InvoiceD__1F1578F1BFDD3FE0");

            entity.Property(e => e.Quantity).HasDefaultValue(1);
            entity.Property(e => e.SubTotal).HasComputedColumnSql("([Quantity]*[UnitPrice])", true);

            entity.HasOne(d => d.Invoice).WithMany(p => p.InvoiceDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__InvoiceDe__Invoi__73BA3083");
        });

        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasKey(e => e.PromotionId).HasName("PK__Promotio__52C42F2F62752000");
        });

        modelBuilder.Entity<Room>(entity =>
        {
            entity.HasKey(e => e.RoomId).HasName("PK__Room__3286391998F894B5");

            entity.Property(e => e.Status).HasDefaultValue("Empty");

            entity.HasOne(d => d.Hotel).WithMany(p => p.Rooms)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Room__HotelID__4F7CD00D");

            entity.HasOne(d => d.RoomType).WithMany(p => p.Rooms)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Room__RoomTypeID__4E88ABD4");
        });

        modelBuilder.Entity<RoomMaintenance>(entity =>
        {
            entity.HasKey(e => e.MaintenanceId).HasName("PK__RoomMain__E60542B54A588FEE");

            entity.Property(e => e.Status).HasDefaultValue("Pending");

            entity.HasOne(d => d.Room).WithMany(p => p.RoomMaintenances)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__RoomMaint__RoomI__1F98B2C1");
        });

        modelBuilder.Entity<RoomType>(entity =>
        {
            entity.HasKey(e => e.RoomTypeId).HasName("PK__RoomType__BCC8961155B11585");

            entity.Property(e => e.MaxAdult).HasDefaultValue(2);
            entity.Property(e => e.MaxChild).HasDefaultValue(1);
        });

        modelBuilder.Entity<Salary>(entity =>
        {
            entity.HasKey(e => e.SalaryId).HasName("PK__Salary__4BE204B7A578A630");

            entity.Property(e => e.Bonus).HasDefaultValue(0m);
            entity.Property(e => e.Othours).HasDefaultValue(0);
            entity.Property(e => e.Penalty).HasDefaultValue(0m);
            entity.Property(e => e.WorkingDays).HasDefaultValue(0);

            entity.HasOne(d => d.Employee).WithMany(p => p.Salaries)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Salary__Employee__09A971A2");
        });

        modelBuilder.Entity<SalaryDetail>(entity =>
        {
            entity.HasKey(e => e.SalaryDetailId).HasName("PK__SalaryDe__EE7B1FE465B5830A");

            entity.HasOne(d => d.Salary).WithMany(p => p.SalaryDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__SalaryDet__Salar__0D7A0286");
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasKey(e => e.ServiceId).HasName("PK__Service__C51BB0EA97D6864B");
        });

        modelBuilder.Entity<ServiceDetail>(entity =>
        {
            entity.HasKey(e => e.ServiceDetailId).HasName("PK__ServiceD__6F80952CD5612F7D");

            entity.Property(e => e.CreatedDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Booking).WithMany(p => p.ServiceDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ServiceDe__Booki__6383C8BA");

            entity.HasOne(d => d.Service).WithMany(p => p.ServiceDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ServiceDe__Servi__6477ECF3");
        });

        modelBuilder.Entity<Shift>(entity =>
        {
            entity.HasKey(e => e.ShiftId).HasName("PK__Shift__C0A838E113A14678");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
