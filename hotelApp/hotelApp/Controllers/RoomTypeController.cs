using hotelApp.DTOs;
using hotelApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace hotelApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomTypesController : ControllerBase
    {
        private readonly IRoomTypeService _service;

        public RoomTypesController(IRoomTypeService service)
        {
            _service = service;
        }

        // GET: api/roomtypes/hotel/5 (Lấy danh sách phòng theo HotelID)
        [HttpGet("hotel/{hotelId}")]
        public async Task<IActionResult> GetByHotel(int hotelId)
        {
            var result = await _service.GetRoomTypesByHotel(hotelId);
            return Ok(result);
        }

        // GET: api/roomtypes/5 (Lấy chi tiết 1 loại phòng)
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
            // Kiểm tra tính hợp lệ của dữ liệu (VD: Giá < 0, Tên rỗng...)
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var createdRoom = await _service.CreateRoomType(input);

                // Trả về mã 201 Created kèm theo thông tin phòng vừa tạo
                return CreatedAtAction(nameof(GetById), new { id = createdRoom.RoomTypeID }, createdRoom);
            }
            catch (Exception ex)
            {
                // Ghi log lỗi nếu cần
                return StatusCode(500, "Lỗi Server: " + ex.Message);
            }
        }

        // PUT: api/roomtypes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] RoomTypeUpdateDto input)
        {
            if (id != input.RoomTypeID)
                return BadRequest("ID không khớp.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                await _service.UpdateRoomType(id, input);
                return Ok(new { message = "Cập nhật thành công!" });
            }
            catch (Exception ex)
            {
                // Nếu lỗi "Không tìm thấy" -> 404
                if (ex.Message.Contains("Không tìm thấy")) return NotFound();

                return StatusCode(500, "Lỗi Server: " + ex.Message);
            }
        }

        // DELETE: api/roomtypes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteRoomType(id);
            return NoContent();
        }
    }
}