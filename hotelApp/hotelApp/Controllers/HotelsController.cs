using AutoMapper;
using hotelApp.DTOs;
using hotelApp.Models;
using hotelApp.Reposities;
using Microsoft.AspNetCore.Mvc;

namespace hotelApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HotelsController : ControllerBase
    {
        private readonly IHotelRepository _hotelRepo;
        private readonly IMapper _mapper;
        private readonly HotelContext _db;

        public HotelsController(IHotelRepository hotelRepo, IMapper mapper, HotelContext db)
        {
            _hotelRepo = hotelRepo;
            _mapper = mapper;
            _db = db;
        }

        // ==========================================
        // 1. GET: api/hotels (Lấy danh sách - QUAN TRỌNG)
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await _hotelRepo.GetAllHotelsAsync(pageIndex, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // ==========================================
        // 2. GET: api/locations (Dropdown địa điểm)
        // ==========================================
        [HttpGet("~/api/locations")]
        public async Task<IActionResult> GetLocations()
        {
            var locations = await _hotelRepo.GetLocationsAsync();
            var result = locations.Select(x => new LocationOptionDto
            {
                LocationID = x.LocationId,
                LocationName = x.LocationName
            });
            return Ok(result);
        }

        // ==========================================
        // 3. POST: api/hotels (Thêm mới)
        // ==========================================
        [HttpPost]
        public async Task<IActionResult> CreateHotel([FromForm] HotelDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                // 1. Map DTO -> Entity
                var hotel = _mapper.Map<Hotel>(dto);

                // 2. Xử lý TimeOnly
                if (!string.IsNullOrEmpty(dto.CheckInTime) && TimeOnly.TryParse(dto.CheckInTime, out var inTime))
                    hotel.CheckInTime = inTime;

                if (!string.IsNullOrEmpty(dto.CheckOutTime) && TimeOnly.TryParse(dto.CheckOutTime, out var outTime))
                    hotel.CheckOutTime = outTime;

                // 3. Lưu Hotel
                var createdHotel = await _hotelRepo.AddHotelAsync(hotel);

                // 4. Xử lý Ảnh
                if (dto.ImageFile != null && dto.ImageFile.Length > 0)
                {
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.ImageFile.FileName);
                    var uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

                    if (!Directory.Exists(uploadFolder)) Directory.CreateDirectory(uploadFolder);

                    var filePath = Path.Combine(uploadFolder, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.ImageFile.CopyToAsync(stream);
                    }

                    var imgEntity = new HotelImage
                    {
                        HotelId = createdHotel.HotelId,
                        ImageUrl = "/uploads/" + fileName,
                        IsMain = true
                    };

                    _db.HotelImages.Add(imgEntity);
                    await _db.SaveChangesAsync();
                }

                return Ok(new { message = "Thêm thành công", id = createdHotel.HotelId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi server: " + ex.Message);
            }
        }

        // ==========================================
        // 4. GET: api/hotels/5 (Chi tiết)
        // ==========================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetHotelById(int id)
        {
            var hotel = await _hotelRepo.GetHotelDtoByIdAsync(id);
            if (hotel == null) return NotFound(new { message = "Không tìm thấy khách sạn" });
            return Ok(hotel);
        }

        // ==========================================
        // 5. DELETE: api/hotels/5 (Xóa)
        // ==========================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHotel(int id)
        {
            var result = await _hotelRepo.DeleteHotelAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Đã xóa thành công" });
        }
    }
}