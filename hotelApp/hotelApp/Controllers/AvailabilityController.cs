using hotelApp.DTOs;
using hotelApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace hotelApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AvailabilityController : ControllerBase
    {
        private readonly IAvailabilityService _service;

        public AvailabilityController(IAvailabilityService service)
        {
            _service = service;
        }

        // GET: api/availability?roomTypeId=1&month=12&year=2024
        [HttpGet]
        public async Task<IActionResult> GetCalendar(int roomTypeId, int month, int year)
        {
            var result = await _service.GetCalendarAsync(roomTypeId, month, year);
            return Ok(result);
        }

        // POST: api/availability/bulk-update
        [HttpPost("bulk-update")]
        public async Task<IActionResult> BulkUpdate([FromBody] BulkUpdateDto input)
        {
            try
            {
                await _service.BulkUpdateAsync(input);
                return Ok(new { message = "Cập nhật thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
