namespace hotelApp.DTOs
{
    // DTO hiển thị ra lịch
    public class CalendarDto
    {
        public DateOnly Date { get; set; }
        public decimal Price { get; set; }
        public int AvailableQty { get; set; }
        public bool IsClosed { get; set; }
    }

    // DTO nhận dữ liệu cập nhật hàng loạt (Bulk Update)
    public class BulkUpdateDto
    {
        public int RoomTypeID { get; set; }
        public DateOnly FromDate { get; set; }
        public DateOnly ToDate { get; set; }
        public decimal? Price { get; set; } // Nullable: Nếu null thì giữ nguyên giá cũ
        public int? AvailableQty { get; set; }
        public bool? IsClosed { get; set; }
    }
}
