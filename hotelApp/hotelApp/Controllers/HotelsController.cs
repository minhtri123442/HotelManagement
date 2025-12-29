using AutoMapper;
using hotelApp.DTOs;
using hotelApp.Models;
using hotelApp.Repositories;
using hotelApp.Services; // Nhớ using namespace này
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
        private readonly IPhotoService _photoService; // Thay IWebHostEnvironment bằng IPhotoService

        public HotelsController(IHotelRepository hotelRepo, IMapper mapper, HotelContext db, IPhotoService photoService)
        {
            _hotelRepo = hotelRepo;
            _mapper = mapper;
            _db = db;
            _photoService = photoService;
        }

        // ... CÁC HÀM GET GIỮ NGUYÊN ...
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _hotelRepo.GetAllHotelsAsync(pageIndex, pageSize);
            return Ok(result);
        }

        [HttpGet("~/api/locations")]
        public async Task<IActionResult> GetLocations()
        {
            var locations = await _hotelRepo.GetLocationsAsync();
            return Ok(locations.Select(x => new LocationOptionDto { LocationID = x.LocationId, LocationName = x.LocationName }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetHotelById(int id)
        {
            var hotel = await _hotelRepo.GetHotelDtoByIdAsync(id);
            if (hotel == null) return NotFound(new { message = "Không tìm thấy khách sạn" });
            return Ok(hotel);
        }

        // ==========================================
        // CREATE HOTEL (SỬ DỤNG CLOUDINARY)
        // ==========================================
        [HttpPost]
        [HttpPost]
        public async Task<IActionResult> CreateHotel([FromForm] HotelDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var hotel = _mapper.Map<Hotel>(dto);

                if (!string.IsNullOrEmpty(dto.CheckInTime) && TimeOnly.TryParse(dto.CheckInTime, out var inTime)) hotel.CheckInTime = inTime;
                if (!string.IsNullOrEmpty(dto.CheckOutTime) && TimeOnly.TryParse(dto.CheckOutTime, out var outTime)) hotel.CheckOutTime = outTime;

                // 1. Lưu thông tin Hotel trước
                // QUAN TRỌNG: Hotel phải được lưu thì mới có HotelId để gán cho ảnh
                var createdHotel = await _hotelRepo.AddHotelAsync(hotel);

                // (Mẹo: Nếu Repository của bạn chưa SaveChanges, hãy uncomment dòng dưới)
                // await _db.SaveChangesAsync(); 

                // --- HÀM LOCAL UPLOAD ---
                async Task UploadAndSaveToDb(IFormFile file, bool isMain)
                {
                    var result = await _photoService.AddPhotoAsync(file);
                    if (result.Error != null) throw new Exception(result.Error.Message);

                    var imgEntity = new HotelImage
                    {
                        HotelId = createdHotel.HotelId,
                        ImageUrl = result.SecureUrl.AbsoluteUri,
                        IsMain = isMain,
                        Caption = "Hình ảnh khách sạn" // <--- THÊM DÒNG NÀY (Tránh lỗi DB bắt buộc nhập Caption)
                    };
                    _db.HotelImages.Add(imgEntity);
                }

                // 2. Upload Ảnh chính
                if (dto.ImageFile != null) await UploadAndSaveToDb(dto.ImageFile, true);

                // 3. Upload Ảnh phụ
                if (dto.GalleryFiles != null)
                {
                    foreach (var file in dto.GalleryFiles) await UploadAndSaveToDb(file, false);
                }

                await _db.SaveChangesAsync();
                return Ok(new { message = "Thêm thành công", id = createdHotel.HotelId });
            }
            catch (Exception ex)
            {
                // --- SỬA ĐOẠN NÀY ĐỂ HIỆN LỖI GỐC ---
                // Lấy lỗi sâu nhất bên trong (InnerException) để biết tại sao DB từ chối
                var innerMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, "Lỗi server: " + innerMessage);
            }
        }

        // ==========================================
        // UPDATE HOTEL (SỬ DỤNG CLOUDINARY)
        // ==========================================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHotel(int id, [FromForm] HotelDto dto)
        {
            try
            {
                var existingHotel = await _hotelRepo.GetHotelEntityByIdAsync(id);
                if (existingHotel == null) return NotFound("Không tìm thấy khách sạn");

                // Update thông tin cơ bản
                existingHotel.Name = dto.Name;
                existingHotel.Slug = dto.Slug;
                existingHotel.Address = dto.Address;
                existingHotel.LocationId = dto.LocationID;
                existingHotel.Description = dto.Description;
                existingHotel.StarRating = dto.StarRating;
                existingHotel.Status = dto.Status;
                existingHotel.MapUrl = dto.MapUrl;
                existingHotel.MapLatitude = dto.MapLatitude;
                existingHotel.MapLongitude = dto.MapLongitude;

                if (!string.IsNullOrEmpty(dto.CheckInTime) && TimeOnly.TryParse(dto.CheckInTime, out var inTime)) existingHotel.CheckInTime = inTime;
                if (!string.IsNullOrEmpty(dto.CheckOutTime) && TimeOnly.TryParse(dto.CheckOutTime, out var outTime)) existingHotel.CheckOutTime = outTime;

                // --- HÀM LOCAL UPLOAD CLOUDINARY ---
                async Task UploadAndSaveToDb(IFormFile file, bool isMain)
                {
                    var result = await _photoService.AddPhotoAsync(file);
                    if (result.Error != null) throw new Exception(result.Error.Message);

                    if (isMain)
                    {
                        var oldMain = existingHotel.HotelImages.FirstOrDefault(x => x.IsMain ?? false);
                        if (oldMain != null) oldMain.IsMain = false;
                    }

                    existingHotel.HotelImages.Add(new HotelImage
                    {
                        ImageUrl = result.SecureUrl.AbsoluteUri,
                        IsMain = isMain
                    });
                }

                // Upload ảnh mới
                if (dto.ImageFile != null) await UploadAndSaveToDb(dto.ImageFile, true);
                if (dto.GalleryFiles != null)
                {
                    foreach (var file in dto.GalleryFiles) await UploadAndSaveToDb(file, false);
                }

                await _hotelRepo.UpdateHotelAsync(existingHotel);
                return Ok(new { message = "Cập nhật thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi cập nhật: " + ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHotel(int id)
        {
            var result = await _hotelRepo.DeleteHotelAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Đã xóa thành công" });
        }
    }
}