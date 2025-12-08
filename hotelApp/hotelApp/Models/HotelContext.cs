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

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=.\\SQLEXPRESS;Database=Hotel_Management;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.HasKey(e => e.AttendanceId).HasName("PK__Attendan__8B69263C2FC85E36");

            entity.Property(e => e.Status).HasDefaultValue("Có mặt");

            entity.HasOne(d => d.Employee).WithMany(p => p.Attendances)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Attendanc__Emplo__7C4F7684");

            entity.HasOne(d => d.Shift).WithMany(p => p.Attendances)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Attendanc__Shift__7D439ABD");
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.BookingId).HasName("PK__Booking__73951ACD69BA0FBB");

            entity.Property(e => e.BookingDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Deposit).HasDefaultValue(0m);
            entity.Property(e => e.Status).HasDefaultValue("Booked");

            entity.HasOne(d => d.Customer).WithMany(p => p.Bookings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Booking__Custome__5629CD9C");

            entity.HasOne(d => d.Room).WithMany(p => p.Bookings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Booking__RoomID__571DF1D5");
        });

        modelBuilder.Entity<CheckHistory>(entity =>
        {
            entity.HasKey(e => e.HistoryId).HasName("PK__CheckHis__4D7B4ADD04C86A1D");

            entity.Property(e => e.ActionDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Booking).WithMany(p => p.CheckHistories)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CheckHist__Booki__73BA3083");

            entity.HasOne(d => d.Employee).WithMany(p => p.CheckHistories).HasConstraintName("FK__CheckHist__Emplo__74AE54BC");
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.CustomerId).HasName("PK__Customer__A4AE64B83106192A");

            entity.Property(e => e.CreatedDate).HasDefaultValueSql("(getdate())");
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.EmployeeId).HasName("PK__Employee__7AD04FF197A13707");

            entity.Property(e => e.CreatedDate).HasDefaultValueSql("(getdate())");
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__Feedback__6A4BEDF67BA15A56");

            entity.Property(e => e.CreatedDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Booking).WithMany(p => p.Feedbacks).HasConstraintName("FK__Feedback__Bookin__0F624AF8");

            entity.HasOne(d => d.Customer).WithMany(p => p.Feedbacks).HasConstraintName("FK__Feedback__Custom__0E6E26BF");
        });

        modelBuilder.Entity<Guest>(entity =>
        {
            entity.HasKey(e => e.GuestId).HasName("PK__Guest__0C423C324A3B9BDC");

            entity.HasOne(d => d.Booking).WithMany(p => p.Guests)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Guest__BookingID__160F4887");
        });

        modelBuilder.Entity<Hotel>(entity =>
        {
            entity.HasKey(e => e.HotelId).HasName("PK__Hotel__46023BBF2ABC0AEF");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Status).HasDefaultValue("Active");
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.InvoiceId).HasName("PK__Invoice__D796AAD5A006D496");

            entity.Property(e => e.CreatedDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Discount).HasDefaultValue(0m);
            entity.Property(e => e.FinalAmount).HasDefaultValue(0m);
            entity.Property(e => e.Status).HasDefaultValue("Unpaid");
            entity.Property(e => e.Tax).HasDefaultValue(0m);
            entity.Property(e => e.TotalRoomCharge).HasDefaultValue(0m);
            entity.Property(e => e.TotalServiceCharge).HasDefaultValue(0m);

            entity.HasOne(d => d.Booking).WithMany(p => p.Invoices)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Invoice__Booking__6A30C649");
        });

        modelBuilder.Entity<InvoiceDetail>(entity =>
        {
            entity.HasKey(e => e.InvoiceDetailId).HasName("PK__InvoiceD__1F1578F1C0CAF1E9");

            entity.Property(e => e.Quantity).HasDefaultValue(1);
            entity.Property(e => e.SubTotal).HasComputedColumnSql("([Quantity]*[UnitPrice])", true);

            entity.HasOne(d => d.Invoice).WithMany(p => p.InvoiceDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__InvoiceDe__Invoi__6EF57B66");
        });

        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasKey(e => e.PromotionId).HasName("PK__Promotio__52C42F2FDE094BCE");
        });

        modelBuilder.Entity<Room>(entity =>
        {
            entity.HasKey(e => e.RoomId).HasName("PK__Room__328639196EE024BE");

            entity.Property(e => e.Status).HasDefaultValue("Empty");

            entity.HasOne(d => d.Hotel).WithMany(p => p.Rooms)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Room__HotelID__4AB81AF0");

            entity.HasOne(d => d.RoomType).WithMany(p => p.Rooms)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Room__RoomTypeID__49C3F6B7");
        });

        modelBuilder.Entity<RoomMaintenance>(entity =>
        {
            entity.HasKey(e => e.MaintenanceId).HasName("PK__RoomMain__E60542B5CD1DE2AD");

            entity.Property(e => e.Status).HasDefaultValue("Pending");

            entity.HasOne(d => d.Room).WithMany(p => p.RoomMaintenances)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__RoomMaint__RoomI__1AD3FDA4");
        });

        modelBuilder.Entity<RoomType>(entity =>
        {
            entity.HasKey(e => e.RoomTypeId).HasName("PK__RoomType__BCC89611EA31564B");

            entity.Property(e => e.MaxAdult).HasDefaultValue(2);
            entity.Property(e => e.MaxChild).HasDefaultValue(1);
        });

        modelBuilder.Entity<Salary>(entity =>
        {
            entity.HasKey(e => e.SalaryId).HasName("PK__Salary__4BE204B709106BDC");

            entity.Property(e => e.Bonus).HasDefaultValue(0m);
            entity.Property(e => e.Othours).HasDefaultValue(0);
            entity.Property(e => e.Penalty).HasDefaultValue(0m);
            entity.Property(e => e.WorkingDays).HasDefaultValue(0);

            entity.HasOne(d => d.Employee).WithMany(p => p.Salaries)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Salary__Employee__04E4BC85");
        });

        modelBuilder.Entity<SalaryDetail>(entity =>
        {
            entity.HasKey(e => e.SalaryDetailId).HasName("PK__SalaryDe__EE7B1FE4163AE314");

            entity.HasOne(d => d.Salary).WithMany(p => p.SalaryDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__SalaryDet__Salar__08B54D69");
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasKey(e => e.ServiceId).HasName("PK__Service__C51BB0EA23B5CD8D");
        });

        modelBuilder.Entity<ServiceDetail>(entity =>
        {
            entity.HasKey(e => e.ServiceDetailId).HasName("PK__ServiceD__6F80952C21EC015B");

            entity.Property(e => e.CreatedDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Booking).WithMany(p => p.ServiceDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ServiceDe__Booki__5EBF139D");

            entity.HasOne(d => d.Service).WithMany(p => p.ServiceDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ServiceDe__Servi__5FB337D6");
        });

        modelBuilder.Entity<Shift>(entity =>
        {
            entity.HasKey(e => e.ShiftId).HasName("PK__Shift__C0A838E1DA807EE8");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
