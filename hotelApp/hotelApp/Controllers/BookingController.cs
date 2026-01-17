using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using hotelApp.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using hotelApp.Services;

namespace hotelApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly HotelContext _context;
        private readonly IEmailService _emailService;

        public BookingsController(HotelContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // 1. LẤY DANH SÁCH CHO ADMIN
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetBookings()
        {
            var bookings = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Hotel)
                .Select(b => new {
                    b.BookingId,
                    b.BookingCode,
                    b.BookingDate,
                    CheckInDate = b.CheckInDate.ToString("yyyy-MM-dd"),
                    CheckOutDate = b.CheckOutDate.ToString("yyyy-MM-dd"),
                    b.TotalAmount,
                    b.Status,
                    b.PaymentStatus,
                    CustomerName = b.User != null ? b.User.FullName : "N/A",
                    HotelName = b.Hotel != null ? b.Hotel.Name : "N/A",
                    b.SpecialRequest
                })
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();

            return Ok(bookings);
        }

        // 2. LẤY CHI TIẾT
        [HttpGet("{id}", Name = "GetBooking")]
        public async Task<ActionResult<Booking>> GetBooking(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .Include(b => b.Hotel)
                .FirstOrDefaultAsync(b => b.BookingId == id);

            if (booking == null) return NotFound();
            return Ok(booking);
        }

        // 3. ĐẶT PHÒNG (TRỪ PHÒNG NGAY LÚC NÀY)
        [HttpPost]
        public async Task<ActionResult<Booking>> PostBooking([FromBody] BookingRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var userExists = await _context.Users.AnyAsync(u => u.UserId == request.UserId);
                if (!userExists) return BadRequest("Người dùng không tồn tại.");

                var hotel = await _context.Hotels.FindAsync(request.HotelId);
                if (hotel == null) return BadRequest("Khách sạn không tồn tại.");

                // Tạo mã Booking
                string hotelAbbr = new string(hotel.Name.Split(' ').Where(s => !string.IsNullOrEmpty(s)).Select(s => s[0]).ToArray()).ToUpper();
                if (hotelAbbr.Length > 4) hotelAbbr = hotelAbbr.Substring(0, 4);
                string timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
                string finalBookingCode = $"{hotelAbbr}-{timestamp}";

                var booking = new Booking
                {
                    BookingCode = finalBookingCode,
                    UserId = request.UserId,
                    HotelId = request.HotelId,
                    BookingDate = DateTime.Now,
                    CheckInDate = DateOnly.FromDateTime(request.CheckInDate),
                    CheckOutDate = DateOnly.FromDateTime(request.CheckOutDate),
                    TotalAmount = request.TotalAmount,
                    Status = "Pending",
                    PaymentStatus = "Unpaid",
                    SpecialRequest = request.SpecialRequest
                };

                if (request.BookingDetails != null)
                {
                    foreach (var item in request.BookingDetails)
                    {
                        var roomType = await _context.RoomTypes.FindAsync(item.RoomTypeId);
                        if (roomType == null) return BadRequest($"Loại phòng {item.RoomTypeId} không tồn tại.");

                        booking.BookingDetails.Add(new BookingDetail
                        {
                            RoomTypeId = item.RoomTypeId,
                            Quantity = item.Quantity ?? 1,
                            PricePerNight = item.Price
                        });
                    }
                }

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                // --- LOGIC MỚI: TRỪ KHO NGAY KHI ĐẶT ---
                // Load lại đầy đủ info để hàm Helper chạy được
                var fullBooking = await _context.Bookings
                    .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.RoomType)
                    .FirstOrDefaultAsync(b => b.BookingId == booking.BookingId);

                await UpdateRoomStock(fullBooking, isDeduct: true);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return CreatedAtRoute("GetBooking", new { id = booking.BookingId }, booking);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest($"Lỗi: {ex.Message}");
            }
        }

        // 4. CẬP NHẬT TRẠNG THÁI (ADMIN LÀM)
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] System.Text.Json.JsonElement body)
        {
            var booking = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.RoomType)
                .FirstOrDefaultAsync(b => b.BookingId == id);

            if (booking == null) return NotFound("Không tìm thấy đơn hàng");

            string oldStatus = booking.Status;
            string newStatus = body.GetString();

            // Nếu Admin Hủy một đơn đã từng trừ kho (Pending hoặc Confirmed) -> Hoàn kho
            if (newStatus == "Cancelled" && oldStatus != "Cancelled")
            {
                await UpdateRoomStock(booking, isDeduct: false);
            }
            // Nếu chuyển sang Confirmed -> Không cần trừ kho nữa vì đã trừ lúc Post
            // Nhưng ta gửi Email hóa đơn tại đây
            else if (newStatus == "Confirmed" && oldStatus != "Confirmed")
            {
                try
                {
                    if (booking.User != null)
                    {
                        var firstDetail = booking.BookingDetails.FirstOrDefault();
                        string roomName = firstDetail?.RoomType?.Name ?? "Phòng khách sạn";
                        await _emailService.SendInvoiceEmailAsync(booking, booking.User, roomName);
                    }
                }
                catch { /* Log error */ }
            }

            booking.Status = newStatus;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // 5. KHÁCH TỰ HỦY (CŨNG PHẢI HOÀN KHO)
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.RoomType)
                .FirstOrDefaultAsync(b => b.BookingId == id);

            if (booking == null) return NotFound();
            if (booking.Status != "Pending") return BadRequest("Chỉ có thể hủy đơn chờ xác nhận.");

            // Hoàn lại kho phòng
            await UpdateRoomStock(booking, isDeduct: false);

            booking.Status = "Cancelled";
            await _context.SaveChangesAsync();
            return Ok();
        }

        // --- HÀM HELPER XỬ LÝ KHO PHÒNG (GIỮ NGUYÊN) ---
        private async Task UpdateRoomStock(Booking booking, bool isDeduct)
        {
            foreach (var detail in booking.BookingDetails)
            {
                DateOnly currentDate = booking.CheckInDate;
                DateOnly endDate = booking.CheckOutDate;

                while (currentDate < endDate)
                {
                    var availability = await _context.RoomAvailabilities
                        .FirstOrDefaultAsync(a => a.RoomTypeId == detail.RoomTypeId && a.Date == currentDate);

                    int quantityToChange = (detail.Quantity ?? 1);

                    if (availability != null)
                    {
                        if (isDeduct) availability.AvailableQty -= quantityToChange;
                        else availability.AvailableQty += quantityToChange;
                    }
                    else if (isDeduct) // Chỉ tạo mới nếu là trừ kho
                    {
                        int baseStock = detail.RoomType.Quantity ?? 0;
                        var newRecord = new RoomAvailability
                        {
                            RoomTypeId = detail.RoomTypeId,
                            Date = currentDate,
                            Price = detail.PricePerNight,
                            AvailableQty = baseStock - quantityToChange,
                            IsClosed = false
                        };
                        _context.RoomAvailabilities.Add(newRecord);
                    }
                    currentDate = currentDate.AddDays(1);
                }
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetBookingsByUser(int userId)
        {
            var bookings = await _context.Bookings
                .Where(b => b.UserId == userId)
                .Include(b => b.Hotel).ThenInclude(h => h.HotelImages)
                .Include(b => b.BookingDetails).ThenInclude(bd => bd.RoomType)
                .OrderByDescending(b => b.BookingDate)
                .Select(b => new
                {
                    b.BookingId,
                    b.BookingCode,
                    b.BookingDate,
                    CheckInDate = b.CheckInDate.ToString("yyyy-MM-dd"),
                    CheckOutDate = b.CheckOutDate.ToString("yyyy-MM-dd"),
                    b.TotalAmount,
                    b.Status,
                    b.PaymentStatus,
                    HotelName = b.Hotel != null ? b.Hotel.Name : "Unknown Hotel",
                    HotelImage = b.Hotel.HotelImages.Any() ? b.Hotel.HotelImages.First().ImageUrl : "",
                    HotelAddress = b.Hotel != null ? b.Hotel.Address : "",
                    RoomNames = b.BookingDetails.Select(bd => bd.RoomType.Name).ToList(),
                    TotalRooms = b.BookingDetails.Sum(bd => bd.Quantity)
                })
                .ToListAsync();

            return Ok(bookings);
        }
    }

    public class BookingRequest
    {
        public int UserId { get; set; }
        public int HotelId { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string? SpecialRequest { get; set; }
        public List<BookingDetailRequest> BookingDetails { get; set; } = new List<BookingDetailRequest>();
    }

    public class BookingDetailRequest
    {
        public int RoomTypeId { get; set; }
        public int? Quantity { get; set; }
        public decimal Price { get; set; }
    }
}