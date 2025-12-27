using hotelApp.DTOs;
using hotelApp.Models;
using hotelApp.Services;
using hotelApp.Repositories; // Cần thêm namespace này
using Microsoft.AspNetCore.Mvc;

namespace hotelApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomTypesController : ControllerBase
    {
        private readonly IRoomTypeService _service;

        // 1. Cần thêm Repository này để thao tác với bảng Lịch & Giá
        private readonly IRoomAvailabilityRepository _availRepo;

        public RoomTypesController(IRoomTypeService service, IRoomAvailabilityRepository availRepo)
        {
            _service = service;
            _availRepo = availRepo;
        }

        [HttpGet("hotel/{hotelId}")]
        public async Task<IActionResult> GetByHotel(int hotelId)
        {
            var result = await _service.GetRoomTypesByHotel(hotelId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetRoomTypeById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        // POST: api/roomtypes
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] RoomTypeCreateDto input)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                // Bước 1: Tạo Loại phòng (RoomType)
                var createdRoom = await _service.CreateRoomType(input);

                // =========================================================================
                // Bước 2: TỰ ĐỘNG SINH DỮ LIỆU LỊCH CHO 30 NGÀY TỚI 
                // =========================================================================
                var today = DateOnly.FromDateTime(DateTime.Now);

                for (int i = 0; i < 30; i++)
                {
                    var date = today.AddDays(i);

                    var availability = new RoomAvailability
                    {
                        RoomTypeId = createdRoom.RoomTypeID, // Lấy ID vừa tạo
                        Date = date,
                        // Lấy số lượng và giá gốc từ input người dùng nhập
                        AvailableQty = input.Quantity,
                        Price = input.BasePrice,
                        IsClosed = false
                    };

                    await _availRepo.AddAsync(availability);
                }

                // Lưu danh sách lịch vào DB
                await _availRepo.SaveChangesAsync();
                // =========================================================================

                return CreatedAtAction(nameof(GetById), new { id = createdRoom.RoomTypeID }, createdRoom);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi Server: " + ex.Message);
            }
        }

        // PUT: api/roomtypes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] RoomTypeUpdateDto input)
        {
            if (id != input.RoomTypeID) return BadRequest("ID không khớp.");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                // Bước 1: Cập nhật thông tin gốc
                await _service.UpdateRoomType(id, input);

                // =========================================================================
                // Bước 2: ĐỒNG BỘ SỐ LƯỢNG SANG BẢNG LỊCH (Logic bổ sung)
                // =========================================================================
                // Nếu người dùng thay đổi "Tổng số lượng" (VD: xây thêm phòng, từ 5 lên 10)
                // Ta cần cập nhật lại AvailableQty cho các ngày TƯƠNG LAI chưa có booking.

                // Lưu ý: Đây là logic cập nhật đơn giản (ghi đè số lượng cũ bằng số lượng mới).
                // Trong thực tế nếu có booking rồi thì logic sẽ phức tạp hơn (NewQty - BookedQty).
                // Ở đây mình làm demo cập nhật cho 30 ngày tới để đồng bộ dữ liệu hiển thị.

                var today = DateOnly.FromDateTime(DateTime.Now);
                var futureDate = today.AddDays(30);

                // Lấy lịch trong 30 ngày tới
                var availabilities = await _availRepo.GetByDateRangeAsync(id, today, futureDate);

                foreach (var item in availabilities)
                {
                    // Cập nhật lại số lượng trống bằng số lượng tổng mới
                    // (Lưu ý: Chỉ nên làm thế này nếu chưa có booking nào trong những ngày này)
                    item.AvailableQty = input.Quantity;

                    // Nếu muốn cập nhật luôn giá gốc (nếu Admin muốn):
                    // item.Price = input.BasePrice; 

                    await _availRepo.UpdateAsync(item);
                }
                await _availRepo.SaveChangesAsync();
                // =========================================================================

                return Ok(new { message = "Cập nhật thành công và đã đồng bộ lịch!" });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Không tìm thấy")) return NotFound();
                return StatusCode(500, "Lỗi Server: " + ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteRoomType(id);
            // Lưu ý: Khi xóa RoomType, CSDL có setup ON DELETE CASCADE
            // nên các dòng bên RoomAvailability sẽ tự động bay màu theo, không cần xóa tay.
            return NoContent();
        }
    }
}