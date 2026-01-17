using AutoMapper;
using AutoMapper.QueryableExtensions; // Cần cái này để dùng ProjectTo
using hotelApp.DTOs;
using hotelApp.Models;
using hotelApp.Repositories;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Repositories
{
    public class HotelRepository : IHotelRepository
    {
        private readonly HotelContext _db;
        private readonly IMapper _mapper;

        public HotelRepository(HotelContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        // ==========================================================
        // 1. GET ALL (Có phân trang)
        // ==========================================================
        public async Task<PagedResult<HotelDto>> GetAllHotelsAsync(int pageIndex, int pageSize)
        {
            var query = _db.Hotels.AsNoTracking(); // Đọc nhanh hơn

            int totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(h => h.HotelId) // Khách sạn mới lên đầu
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ProjectTo<HotelDto>(_mapper.ConfigurationProvider) // Tự động Map và Join bảng ảnh
                .ToListAsync();

            return new PagedResult<HotelDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageIndex = pageIndex,
                PageSize = pageSize
            };
        }// ==========================================================
        // 1.1 GET ALL (lấy dữ liệu của bảng location)
        // ==========================================================
        public async Task<List<Location>> GetLocationsAsync()
        {
            // Lấy danh sách địa điểm, sắp xếp theo tên hoặc độ phổ biến
            return await _db.Locations
                .OrderByDescending(l => l.IsPopular) // Ưu tiên nơi phổ biến lên đầu
                .ThenBy(l => l.LocationName)
                .ToListAsync();
        }
        // ==========================================================
        // 2. GET BY ID (Chi tiết)
        // ==========================================================
        public async Task<HotelDto> GetHotelDtoByIdAsync(int id)
        {
            return await _db.Hotels
                .AsNoTracking()
                .Where(h => h.HotelId == id)
                .ProjectTo<HotelDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();
        }

        // Hàm này lấy Entity gốc để Controller sửa dữ liệu
        public async Task<Hotel> GetHotelEntityByIdAsync(int id)
        {
            return await _db.Hotels
                .Include(h => h.HotelImages) // Include ảnh để nếu cần thì sửa luôn ảnh
                .FirstOrDefaultAsync(h => h.HotelId == id);
        }

        // ==========================================================
        // 3. CREATE (Thêm mới)
        // ==========================================================
        public async Task<Hotel> AddHotelAsync(Hotel hotel)
        {
            hotel.CreatedAt = DateTime.Now;
            hotel.Status = "Active";

            _db.Hotels.Add(hotel);
            await _db.SaveChangesAsync();
            return hotel;
        }

        // ==========================================================
        // 4. UPDATE (Cập nhật)
        // ==========================================================
        public async Task<Hotel> UpdateHotelAsync(Hotel hotel)
        {
            _db.Hotels.Update(hotel);
            await _db.SaveChangesAsync();
            return hotel;
        }

        // ==========================================================
        // 5. DELETE (Xóa mềm - Soft Delete)
        // ==========================================================
        public async Task<bool> DeleteHotelAsync(int id)
        {
            var hotel = await _db.Hotels.FindAsync(id);
            if (hotel == null) return false;

            // Trong hệ thống Booking, KHÔNG NÊN xóa hẳn (Hard Delete) vì sẽ mất lịch sử đơn đặt phòng
            // Chỉ chuyển trạng thái sang Inactive hoặc Deleted
            hotel.Status = "Inactive";

            _db.Hotels.Update(hotel);
            await _db.SaveChangesAsync();
            return true;
        }

        // Nhớ thêm using: hotelApp.DTOs;
        public async Task<List<HotelSearchResultDto>> SearchHotelsAsync(SearchRequestDto req)
        {
            // 1. QUERY CƠ BẢN (Filter SQL)
            // Lấy khách sạn khớp keyword VÀ có ít nhất 1 loại phòng đủ sức chứa người
            var query = _db.Hotels
                .Include(h => h.Location)
                .Include(h => h.HotelImages)
                .Include(h => h.RoomTypes)
                .ThenInclude(rt => rt.RoomAvailabilities) // Load trước lịch để check
                .AsQueryable();

            // Filter theo Keyword (Tên khách sạn hoặc Tên địa điểm)
            if (!string.IsNullOrEmpty(req.Keyword))
            {
                var k = req.Keyword.ToLower();
                query = query.Where(h => h.Name.ToLower().Contains(k)
                                      || h.Location.LocationName.ToLower().Contains(k)
                                      || h.Address.ToLower().Contains(k));
            }

            // Filter theo sức chứa (Chưa check ngày, chỉ check cấu hình phòng)
            // Phải có ít nhất 1 loại phòng chứa đủ người lớn & trẻ em
            query = query.Where(h => h.RoomTypes.Any(rt => rt.MaxAdults >= req.Adults && rt.MaxChildren >= req.Children));

            var candidates = await query.ToListAsync();
            var results = new List<HotelSearchResultDto>();

            // 2. CHECK AVAILABILITY (Logic phức tạp - Xử lý In-Memory)
            foreach (var hotel in candidates)
            {
                decimal? bestPriceForStay = null; // Giá tốt nhất cho cả kỳ nghỉ
                bool isHotelAvailable = false;

                // Duyệt từng loại phòng của khách sạn này
                foreach (var roomType in hotel.RoomTypes)
                {
                    // Bỏ qua nếu phòng không đủ sức chứa
                    if (roomType.MaxAdults < req.Adults || roomType.MaxChildren < req.Children) continue;

                    bool isRoomAvailable = true;
                    decimal totalPrice = 0;

                    // Loop từng ngày từ CheckIn đến CheckOut (không tính ngày CheckOut)
                    for (var date = req.CheckIn; date < req.CheckOut; date = date.AddDays(1))
                    {
                        // Tìm cấu hình của ngày hôm đó trong bảng RoomAvailability
                        var availData = roomType.RoomAvailabilities?.FirstOrDefault(x => x.Date == date);

                        // Xác định số lượng phòng trống & giá
                        // Nếu không có record trong bảng RoomAvailability -> Lấy mặc định từ RoomType
                        int currentQty = availData?.AvailableQty ?? (roomType.Quantity ?? 0);
                        decimal currentPrice = availData?.Price ?? roomType.BasePrice;
                        bool isClosed = availData?.IsClosed ?? false;

                        // Điều kiện Fail: Đóng phòng HOẶC Không đủ số lượng phòng yêu cầu
                        if (isClosed || currentQty < req.Rooms)
                        {
                            isRoomAvailable = false;
                            break; // Gãy chuỗi ngày, loại phòng này không khả dụng
                        }

                        totalPrice += currentPrice;
                    }

                    // Nếu loại phòng này OK cho cả chuỗi ngày
                    if (isRoomAvailable)
                    {
                        isHotelAvailable = true;
                        // Nếu giá này rẻ hơn giá trước đó tìm được thì lấy
                        if (bestPriceForStay == null || totalPrice < bestPriceForStay)
                        {
                            bestPriceForStay = totalPrice;
                        }
                    }
                }

                // Nếu khách sạn có ít nhất 1 phòng thỏa mãn
                if (isHotelAvailable)
                {
                    results.Add(new HotelSearchResultDto
                    {
                        HotelID = hotel.HotelId,
                        Name = hotel.Name,
                        Address = hotel.Address,
                        StarRating = hotel.StarRating ?? 0,
                        ImageUrl = hotel.HotelImages.FirstOrDefault(x => x.IsMain??false)?.ImageUrl ?? hotel.HotelImages.FirstOrDefault()?.ImageUrl,
                        MinPrice = bestPriceForStay ?? 0, // Đây là tổng giá cho cả kỳ nghỉ (hoặc bạn có thể chia trung bình)
                        IsAvailable = true
                    });
                }
            }

            return results;
        }


    }
}