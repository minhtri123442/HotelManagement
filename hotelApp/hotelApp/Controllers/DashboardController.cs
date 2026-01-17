using hotelApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; 

[Route("api/[controller]")]
[ApiController]
public class DashboardController : ControllerBase
{
    private readonly HotelContext _context;

    public DashboardController(HotelContext context)
    {
        _context = context;
    }

    [HttpGet("revenue-stats")]
    public async Task<IActionResult> GetRevenueStats([FromQuery] int? month, [FromQuery] int? year)
    {
        int targetYear = year ?? DateTime.Now.Year;
        var query = _context.Bookings.Where(b => b.BookingDate.Value.Year == targetYear);

        // 1. Tính tổng doanh thu theo trạng thái
        var totalRevenue = await query
             .Where(b => b.Status == "Confirmed")
             .SumAsync(b => (decimal?)b.TotalAmount) ?? 0m;

        // 2. Thống kê số lượng đơn hàng
        var totalBookings = await query.CountAsync();
        var pendingBookings = await query.CountAsync(b => b.Status == "Pending");

        // 3. Doanh thu theo từng tháng (Dùng để vẽ biểu đồ đường/cột)
        var monthlyRevenue = await query
            .Where(b => b.Status == "Confirmed")
            .GroupBy(b => b.BookingDate.Value.Month)
            .Select(g => new {
                Month = g.Key,
                Revenue = g.Sum(b => b.TotalAmount)
            })
            .OrderBy(g => g.Month)
            .ToListAsync();

        // 4. Doanh thu theo từng khách sạn (Dùng để vẽ biểu đồ tròn)
        var hotelRevenue = await query
            .Where(b => b.Status == "Confirmed")
            .Include(b => b.Hotel)
            .GroupBy(b => b.Hotel.Name)
            .Select(g => new {
                HotelName = g.Key,
                Revenue = g.Sum(b => b.TotalAmount)
            })
            .ToListAsync();

        return Ok(new
        {
            TotalRevenue = totalRevenue,
            TotalBookings = totalBookings,
            PendingBookings = pendingBookings,
            MonthlyRevenue = monthlyRevenue,
            HotelRevenue = hotelRevenue
        });
    }
}