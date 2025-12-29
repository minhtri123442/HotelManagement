using hotelApp.DTOs;
using hotelApp.Models;
using hotelApp.Services;
using hotelApp.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace hotelApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomTypesController : ControllerBase
    {
        private readonly IRoomTypeService _service;
        private readonly IRoomAvailabilityRepository _availRepo;

        // 1. Thêm 2 dependency này để xử lý ảnh
        private readonly IPhotoService _photoService;
        private readonly HotelContext _db;

        public RoomTypesController(
            IRoomTypeService service,
            IRoomAvailabilityRepository availRepo,
            IPhotoService photoService,
            HotelContext db)
        {
            _service = service;
            _availRepo = availRepo;
            _photoService = photoService;
            _db = db;
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

        // =========================================================
        // POST: api/roomtypes (Đã tích hợp Cloudinary)
        // =========================================================
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] RoomTypeCreateDto input)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                // Bước 1: Tạo Loại phòng (Chỉ lưu thông tin Text thông qua Service)
                // Lưu ý: Đảm bảo RoomTypeService đã xóa code lưu ảnh local đi rồi nhé!
                var createdRoom = await _service.CreateRoomType(input);

                // --- HÀM LOCAL: UPLOAD ẢNH & LƯU LINK VÀO DB ---
                async Task UploadAndSaveImage(IFormFile file, bool isThumbnail)
                {
                    // a. Upload lên Cloudinary
                    var result = await _photoService.AddPhotoAsync(file);
                    if (result.Error != null) throw new Exception("Lỗi Cloudinary: " + result.Error.Message);

                    // b. Lưu link vào Database
                    if (isThumbnail)
                    {
                        // Cập nhật ThumbnailUrl cho phòng vừa tạo
                        var roomEntity = await _db.RoomTypes.FindAsync(createdRoom.RoomTypeID);
                        if (roomEntity != null)
                        {
                            roomEntity.ThumbnailUrl = result.SecureUrl.AbsoluteUri;
                            _db.RoomTypes.Update(roomEntity);
                        }
                    }
                    else
                    {
                        // Thêm ảnh vào bảng RoomTypeImages
                        var imgEntity = new RoomTypeImage
                        {
                            RoomTypeId = createdRoom.RoomTypeID,
                            ImageUrl = result.SecureUrl.AbsoluteUri,
                            Caption = "Chi tiết"
                        };
                        _db.RoomTypeImages.Add(imgEntity);
                    }
                }

                // Upload Thumbnail (nếu có)
                if (input.ThumbnailImage != null)
                {
                    await UploadAndSaveImage(input.ThumbnailImage, true);
                }

                // Upload Gallery (nếu có)
                if (input.GalleryImages != null && input.GalleryImages.Count > 0)
                {
                    foreach (var file in input.GalleryImages)
                    {
                        await UploadAndSaveImage(file, false);
                    }
                }

                // Lưu các thay đổi về ảnh vào DB
                await _db.SaveChangesAsync();


                // =========================================================================
                // Bước 2: TỰ ĐỘNG SINH DỮ LIỆU LỊCH (Giữ nguyên logic cũ)
                // =========================================================================
                var today = DateOnly.FromDateTime(DateTime.Now);
                for (int i = 0; i < 30; i++)
                {
                    var date = today.AddDays(i);
                    var availability = new RoomAvailability
                    {
                        RoomTypeId = createdRoom.RoomTypeID,
                        Date = date,
                        AvailableQty = input.Quantity,
                        Price = input.BasePrice,
                        IsClosed = false
                    };
                    await _availRepo.AddAsync(availability);
                }
                await _availRepo.SaveChangesAsync();
                // =========================================================================

                return CreatedAtAction(nameof(GetById), new { id = createdRoom.RoomTypeID }, createdRoom);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi Server: " + ex.Message);
            }
        }

        // =========================================================
        // PUT: api/roomtypes/5 (Đã tích hợp Cloudinary)
        // =========================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] RoomTypeUpdateDto input)
        {
            if (id != input.RoomTypeID) return BadRequest("ID không khớp.");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                // Bước 1: Cập nhật thông tin Text qua Service
                await _service.UpdateRoomType(id, input);

                // --- HÀM LOCAL: UPLOAD ẢNH MỚI (Nếu có) ---
                async Task UploadAndSaveImage(IFormFile file, bool isThumbnail)
                {
                    var result = await _photoService.AddPhotoAsync(file);
                    if (result.Error != null) throw new Exception("Lỗi Cloudinary: " + result.Error.Message);

                    if (isThumbnail)
                    {
                        var roomEntity = await _db.RoomTypes.FindAsync(id);
                        if (roomEntity != null)
                        {
                            roomEntity.ThumbnailUrl = result.SecureUrl.AbsoluteUri;
                            _db.RoomTypes.Update(roomEntity);
                        }
                    }
                    else
                    {
                        var imgEntity = new RoomTypeImage
                        {
                            RoomTypeId = id,
                            ImageUrl = result.SecureUrl.AbsoluteUri,
                            Caption = "Chi tiết (Mới)"
                        };
                        _db.RoomTypeImages.Add(imgEntity);
                    }
                }

                // Kiểm tra và upload ảnh Thumbnail mới
                if (input.ThumbnailImage != null)
                {
                    await UploadAndSaveImage(input.ThumbnailImage, true);
                }

                // Kiểm tra và upload ảnh Gallery mới
                if (input.GalleryImages != null && input.GalleryImages.Count > 0)
                {
                    foreach (var file in input.GalleryImages)
                    {
                        await UploadAndSaveImage(file, false);
                    }
                }

                // Lưu ảnh vào DB
                await _db.SaveChangesAsync();


                // =========================================================================
                // Bước 2: ĐỒNG BỘ SỐ LƯỢNG SANG BẢNG LỊCH (Giữ nguyên logic cũ)
                // =========================================================================
                var today = DateOnly.FromDateTime(DateTime.Now);
                var futureDate = today.AddDays(30);
                var availabilities = await _availRepo.GetByDateRangeAsync(id, today, futureDate);

                foreach (var item in availabilities)
                {
                    item.AvailableQty = input.Quantity;
                    // item.Price = input.BasePrice; // Nếu muốn cập nhật giá luôn
                    await _availRepo.UpdateAsync(item);
                }
                await _availRepo.SaveChangesAsync();
                // =========================================================================

                return Ok(new { message = "Cập nhật thành công!" });
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
            // Nếu muốn xóa ảnh trên Cloudinary khi xóa phòng, bạn có thể gọi _photoService.DeletePhotoAsync ở đây
            // Nhưng cần lấy được PublicID của ảnh từ URL trước.
            // Tạm thời mình chỉ xóa DB.
            await _service.DeleteRoomType(id);
            return NoContent();
        }
    }
}