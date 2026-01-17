using AutoMapper;
using hotelApp.DTOs;
using hotelApp.Models;
using hotelApp.Repositories;
using hotelApp.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Quan trọng để dùng Include

namespace hotelApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HotelsController : ControllerBase
    {
        private readonly IHotelRepository _hotelRepo;
        private readonly IMapper _mapper;
        private readonly HotelContext _db; // Inject trực tiếp DB Context để xử lý bảng trung gian
        private readonly IPhotoService _photoService;

        public HotelsController(IHotelRepository hotelRepo, IMapper mapper, HotelContext db, IPhotoService photoService)
        {
            _hotelRepo = hotelRepo;
            _mapper = mapper;
            _db = db;
            _photoService = photoService;
        }

        [HttpGet("/api/locations")] // Dấu / này cực kỳ quan trọng để link là localhost:5134/api/locations
        public async Task<IActionResult> GetLocations()
        {
            var locations = await _db.Locations.ToListAsync();
            // Trả về đúng định dạng mà React đang map (locationId và locationName)
            return Ok(locations.Select(x => new
            {
                locationId = x.LocationId,
                locationName = x.LocationName
            }));
        }

        // 1. GET DETAIL: Lấy khách sạn kèm danh sách tiện ích để hiển thị
        [HttpGet("{id}")]
        public async Task<IActionResult> GetHotelById(int id)
        {
            // Include bảng Amenities để lấy dữ liệu ra
            var hotel = await _db.Hotels
                .Include(h => h.Location)
                .Include(h => h.HotelImages)
                .Include(h => h.HotelAmenities)
                    .ThenInclude(ha => ha.Amenity) // Lấy chi tiết tiện ích (Tên, Icon)
                .FirstOrDefaultAsync(x => x.HotelId == id);

            if (hotel == null) return NotFound(new { message = "Không tìm thấy khách sạn" });

            // Trả về dữ liệu đã format đẹp
            return Ok(new
            {
                hotel.HotelId,
                hotel.Name,
                hotel.Slug,
                hotel.Address,
                hotel.LocationId,
                LocationName = hotel.Location?.LocationName,
                hotel.Description,
                hotel.StarRating,
                hotel.CheckInTime,
                hotel.CheckOutTime,
                hotel.Status,
                hotel.MapUrl,
                // List ảnh
                ImageUrls = hotel.HotelImages.Select(i => i.ImageUrl).ToList(),
                // List tiện ích (Trả về mảng Object để FE hiển thị Icon)
                HotelAmenities = hotel.HotelAmenities.Select(ha => new
                {
                    ha.Amenity.AmenityId,
                    ha.Amenity.Name,
                    ha.Amenity.IconClass,
                    ha.Amenity.Type
                }).ToList(),
                // List ID tiện ích (Dùng để FE tick sẵn vào checkbox khi Edit)
                AmenityIds = hotel.HotelAmenities.Select(ha => ha.AmenityId).ToList()
            });
        }

        // 2. CREATE: Tạo khách sạn và lưu tiện ích
        [HttpPost]
        public async Task<IActionResult> CreateHotel([FromForm] HotelDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            using var transaction = _db.Database.BeginTransaction(); // Dùng Transaction để an toàn dữ liệu
            try
            {
                var hotel = _mapper.Map<Hotel>(dto);

                // Xử lý TimeOnly
                if (!string.IsNullOrEmpty(dto.CheckInTime) && TimeOnly.TryParse(dto.CheckInTime, out var inTime)) hotel.CheckInTime = inTime;
                if (!string.IsNullOrEmpty(dto.CheckOutTime) && TimeOnly.TryParse(dto.CheckOutTime, out var outTime)) hotel.CheckOutTime = outTime;

                // A. Lưu khách sạn trước để có ID
                _db.Hotels.Add(hotel);
                await _db.SaveChangesAsync();

                // B. Lưu Amenities (MỚI THÊM)
                // Đọc danh sách ID từ DTO và thêm vào bảng trung gian HotelAmenities
                if (dto.AmenityIds != null && dto.AmenityIds.Any())
                {
                    foreach (var amenityId in dto.AmenityIds)
                    {
                        // Kiểm tra xem ID tiện ích có tồn tại không (Optional)
                        var exists = await _db.Amenities.AnyAsync(a => a.AmenityId == amenityId);
                        if (exists)
                        {
                            _db.HotelAmenities.Add(new HotelAmenity
                            {
                                HotelId = hotel.HotelId,
                                AmenityId = amenityId
                            });
                        }
                    }
                    await _db.SaveChangesAsync();
                }

                // C. Upload Ảnh (Giữ nguyên logic cũ)
                if (dto.ImageFile != null) await ProcessImageUpload(dto.ImageFile, hotel.HotelId, true);
                if (dto.GalleryFiles != null)
                {
                    foreach (var file in dto.GalleryFiles) await ProcessImageUpload(file, hotel.HotelId, false);
                }

                // Lưu lần cuối cho ảnh
                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Thêm thành công", id = hotel.HotelId });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Lỗi server: " + ex.Message);
            }
        }

        // 3. UPDATE: Cập nhật khách sạn và danh sách tiện ích
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHotel(int id, [FromForm] HotelDto dto)
        {
            try
            {
                var existingHotel = await _db.Hotels
                    .Include(h => h.HotelImages) // Include để xử lý ảnh
                    .FirstOrDefaultAsync(h => h.HotelId == id);

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

                // A. Cập nhật Amenities (QUAN TRỌNG)
                if (dto.AmenityIds != null)
                {
                    // Bước 1: Xóa sạch các tiện ích cũ của khách sạn này
                    var oldAmenities = _db.HotelAmenities.Where(x => x.HotelId == id);
                    _db.HotelAmenities.RemoveRange(oldAmenities);

                    // Bước 2: Thêm lại danh sách mới
                    foreach (var amenityId in dto.AmenityIds)
                    {
                        _db.HotelAmenities.Add(new HotelAmenity
                        {
                            HotelId = id,
                            AmenityId = amenityId
                        });
                    }
                }

                // B. Cập nhật Ảnh (Giữ nguyên)
                if (dto.ImageFile != null) await ProcessImageUpload(dto.ImageFile, id, true, existingHotel);
                if (dto.GalleryFiles != null)
                {
                    foreach (var file in dto.GalleryFiles) await ProcessImageUpload(file, id, false, existingHotel);
                }

                await _db.SaveChangesAsync();
                return Ok(new { message = "Cập nhật thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi cập nhật: " + ex.Message);
            }
        }

        // --- CÁC HÀM PHỤ TRỢ (Copy y nguyên code cũ) ---
        private async Task ProcessImageUpload(IFormFile file, int hotelId, bool isMain, Hotel hotelEntity = null)
        {
            var folderName = $"Hotels/Hotel_{hotelId}";
            var result = await _photoService.AddPhotoAsync(file, folderName);
            if (result.Error != null) throw new Exception("Lỗi Cloudinary: " + result.Error.Message);

            if (isMain && hotelEntity != null)
            {
                var oldMain = hotelEntity.HotelImages.FirstOrDefault(x => x.IsMain == true);
                if (oldMain != null) oldMain.IsMain = false;
            }

            var imgEntity = new HotelImage
            {
                HotelId = hotelId,
                ImageUrl = result.SecureUrl.AbsoluteUri,
                IsMain = isMain,
                Caption = isMain ? "Ảnh đại diện" : "Ảnh chi tiết"
            };

            if (hotelEntity != null) hotelEntity.HotelImages.Add(imgEntity);
            else _db.HotelImages.Add(imgEntity);
        }

        // Các hàm GetAll, Delete, Search giữ nguyên như cũ...
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _hotelRepo.GetAllHotelsAsync(pageIndex, pageSize);
            return Ok(result);
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