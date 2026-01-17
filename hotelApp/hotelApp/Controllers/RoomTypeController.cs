using hotelApp.DTOs;
using hotelApp.Models;
using hotelApp.Services;
using hotelApp.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomTypesController : ControllerBase
    {
        private readonly IRoomTypeService _service;
        private readonly IRoomAvailabilityRepository _availRepo;
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
            //không có thì trả về mảng rỗng
            if (result == null) return Ok(new List<RoomTypeDto>());
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetRoomTypeById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }
        [HttpGet("hotel/{hotelId}/available")]
        public async Task<ActionResult<IEnumerable<RoomType>>> GetAvailableRoomTypes(
            int hotelId,
            DateTime checkIn,
            DateTime checkOut)
        {
            var start = checkIn.Date;
            var end = checkOut.Date;

            // Chuyển đổi sang DateOnly để so sánh với Database (nếu DB lưu DateOnly)
            // Nếu DB lưu DateTime thì xóa dòng DateOnly.FromDateTime đi
            var startDateOnly = DateOnly.FromDateTime(start);
            var endDateOnly = DateOnly.FromDateTime(end);

            var availableRoomTypes = await _db.RoomTypes // SỬA: Dùng _db thay vì _context
                .Where(rt => rt.HotelId == hotelId)
                // LOGIC LỌC PHÒNG TRỐNG CHUẨN:
                // Loại bỏ các phòng có bản ghi trong bảng RoomAvailability
                // mà (Số lượng <= 0 HOẶC Đang đóng) trong khoảng ngày khách chọn
                .Where(rt => !_db.RoomAvailabilities.Any(ra =>
                    ra.RoomTypeId == rt.RoomTypeId &&
                    ra.Date >= startDateOnly &&
                    ra.Date < endDateOnly &&
                    (ra.AvailableQty <= 0 || ra.IsClosed == true)
                ))
                .Include(rt => rt.RoomTypeImages)
                .ToListAsync();

            return Ok(availableRoomTypes);
        }
        // =========================================================
        // HÀM PRIVATE: Xử lý Upload ảnh (Dùng chung cho cả Create và Update)
        // =========================================================
        private async Task ProcessImageUpload(IFormFile file, int hotelId, int roomTypeId, bool isThumbnail)
        {
            // 1. Quy hoạch folder: Rooms/Hotel_1
            var folderName = $"Rooms/Hotel_{hotelId}";

            // 2. Upload lên Cloudinary
            var result = await _photoService.AddPhotoAsync(file, folderName);
            if (result.Error != null) throw new Exception("Lỗi Cloudinary: " + result.Error.Message);

            // 3. Lưu link vào DB
            if (isThumbnail)
            {
                var roomEntity = await _db.RoomTypes.FindAsync(roomTypeId);
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
                    RoomTypeId = roomTypeId,
                    ImageUrl = result.SecureUrl.AbsoluteUri,
                    Caption = isThumbnail ? "Ảnh đại diện" : "Chi tiết"
                };
                _db.RoomTypeImages.Add(imgEntity);
            }
        }

        // =========================================================
        // POST: Create
        // =========================================================
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] RoomTypeCreateDto input)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {

                // Tạo RoomType text trước để lấy ID
                var createdRoom = await _service.CreateRoomType(input);
                // lưu tiện tích
                if (input.AmenityIds != null && input.AmenityIds.Any())
                {
                    foreach (var amenityId in input.AmenityIds)
                    {
                        _db.RoomTypeAmenities.Add(new RoomTypeAmenity
                        {
                            RoomTypeId = createdRoom.RoomTypeID,
                            AmenityId = amenityId
                        });
                    }
                    await _db.SaveChangesAsync();
                }

                //Upload Thumbnail
                if (input.ThumbnailImage != null)
                {
                    await ProcessImageUpload(input.ThumbnailImage, input.HotelID, createdRoom.RoomTypeID, true);
                }

                //Upload Gallery
                if (input.GalleryImages != null && input.GalleryImages.Count > 0)
                {
                    foreach (var file in input.GalleryImages)
                    {
                        await ProcessImageUpload(file, input.HotelID, createdRoom.RoomTypeID, false);
                    }
                }

                // Lưu ảnh vào DB
                await _db.SaveChangesAsync();

                // Sinh lịch 30 ngày
                var today = DateOnly.FromDateTime(DateTime.Now);
                for (int i = 0; i < 30; i++)
                {
                    var availability = new RoomAvailability
                    {
                        RoomTypeId = createdRoom.RoomTypeID,
                        Date = today.AddDays(i),
                        AvailableQty = input.Quantity,
                        Price = input.BasePrice,
                        IsClosed = false
                    };
                    await _availRepo.AddAsync(availability);
                }
                await _availRepo.SaveChangesAsync();

                return CreatedAtAction(nameof(GetById), new { id = createdRoom.RoomTypeID }, createdRoom);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi Server: " + ex.Message);
            }
        }

        // =========================================================
        // PUT: Update
        // =========================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] RoomTypeUpdateDto input)
        {
            if (id != input.RoomTypeID) return BadRequest("ID không khớp.");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                // Lấy thông tin phòng CŨ để biết chính xác nó thuộc Hotel nào (An toàn hơn tin vào input)
                var existingRoom = await _service.GetRoomTypeById(id);
                if (existingRoom == null) return NotFound("Không tìm thấy phòng");

                // Mẹo: DTO trả về thường có HotelID, nếu không có thì bạn phải query Entity. 
                // Giả sử DTO trả về có HotelID hoặc bạn lấy từ input cũng tạm được nếu tin tưởng Front-end.
                int currentHotelId = input.HotelID;

                if (input.AmenityIds != null)
                {
                    // Xóa sạch tiện ích cũ của phòng này
                    var oldAmenities = _db.RoomTypeAmenities.Where(x => x.RoomTypeId == id);
                    _db.RoomTypeAmenities.RemoveRange(oldAmenities);

                    // Thêm lại đống mới từ DTO
                    foreach (var aid in input.AmenityIds)
                    {
                        _db.RoomTypeAmenities.Add(new RoomTypeAmenity
                        {
                            RoomTypeId = id,
                            AmenityId = aid
                        });
                    }
                }

                // Update thông tin Text
                await _service.UpdateRoomType(id, input);

                // Upload Thumbnail Mới
                if (input.ThumbnailImage != null)
                {
                    await ProcessImageUpload(input.ThumbnailImage, currentHotelId, id, true);
                }

                // Upload Gallery Mới
                if (input.GalleryImages != null && input.GalleryImages.Count > 0)
                {
                    foreach (var file in input.GalleryImages)
                    {
                        await ProcessImageUpload(file, currentHotelId, id, false);
                    }
                }

                // Lưu ảnh
                await _db.SaveChangesAsync();

                // Đồng bộ Lịch
                var today = DateOnly.FromDateTime(DateTime.Now);
                var futureDate = today.AddDays(30);
                var availabilities = await _availRepo.GetByDateRangeAsync(id, today, futureDate);

                foreach (var item in availabilities)
                {
                    item.AvailableQty = input.Quantity;
                    await _availRepo.UpdateAsync(item);
                }
                await _availRepo.SaveChangesAsync();

                return Ok(new { message = "Cập nhật thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi Server: " + ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteRoomType(id);
            return NoContent();
        }

        // GET: api/roomtypes/check-availability
        // API này tính toán số phòng trống thực tế trong khoảng thời gian khách chọn
        [HttpGet("check-availability")]
        public async Task<IActionResult> GetRealAvailability(int id, DateTime checkIn, DateTime checkOut)
        {
            // Lấy thông tin phòng gốc
            var roomType = await _db.RoomTypes.FindAsync(id);
            if (roomType == null) return NotFound(new { message = "Không tìm thấy loại phòng" });

            int baseStock = roomType.Quantity ?? 0; // Tổng số phòng vật lý
            int minAvailable = baseStock; // Giả định ban đầu là còn full

            // Chuẩn hóa ngày (chỉ lấy phần ngày, bỏ giờ phút)
            DateOnly startDate = DateOnly.FromDateTime(checkIn);
            DateOnly endDate = DateOnly.FromDateTime(checkOut);

            // Lấy dữ liệu lịch sử dụng phòng trong khoảng này
            var availabilities = await _db.RoomAvailabilities
                .Where(a => a.RoomTypeId == id && a.Date >= startDate && a.Date < endDate)
                .ToListAsync();

            // Thuật toán: Tìm "nút thắt cổ chai" (Ngày nào còn ít phòng nhất)
            for (DateOnly date = startDate; date < endDate; date = date.AddDays(1))
            {
                var record = availabilities.FirstOrDefault(a => a.Date == date);

                // Nếu ngày đó đã có record trong bảng Availability -> Lấy số lượng thực
                // Nếu chưa có -> Tức là chưa ai đặt -> Lấy số lượng gốc (baseStock)
                int stockOnDay = record != null ? record.AvailableQty : baseStock;

                if (stockOnDay < minAvailable)
                {
                    minAvailable = stockOnDay;
                }
            }

            // Trả về số lượng nhỏ nhất tìm được (không được nhỏ hơn 0)
            return Ok(new { availableQty = Math.Max(0, minAvailable) });
        }

    }
}