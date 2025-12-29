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

        // ==========================================================
        // 6. SEARCH (TÌM KIẾM NÂNG CAO - GIỐNG AGODA)
        // ==========================================================
        public async Task<PagedResult<HotelDto>> SearchHotelsAsync(HotelSearchRequest request)
        {
            // Validation cơ bản
            if (request.CheckOutDate <= request.CheckInDate)
                throw new ArgumentException("Ngày Check-out phải lớn hơn Check-in");

            // Param cho SQL
            var parameters = new[]
            {
                new SqlParameter("@LocationID", request.LocationID ?? (object)DBNull.Value),
                new SqlParameter("@Keyword", request.Keyword ?? (object)DBNull.Value),
                new SqlParameter("@CheckInDate", request.CheckInDate),
                new SqlParameter("@CheckOutDate", request.CheckOutDate),
                new SqlParameter("@Adults", request.Adults),
                new SqlParameter("@PageSize", request.PageSize),
                new SqlParameter("@PageIndex", request.PageIndex)
            };

            // Gọi Stored Procedure
            // Lưu ý: EF Core 8 dùng SqlQuery, bản cũ hơn dùng FromSqlRaw.
            // Ta dùng class tạm HotelSearchResultRaw để hứng dữ liệu vì SP trả về cấu trúc phẳng
            string sql = "EXEC sp_SearchAvailableHotels @LocationID, @Keyword, @CheckInDate, @CheckOutDate, @Adults, @PageSize, @PageIndex";

            var rawResults = await _db.Database
                .SqlQueryRaw<HotelSearchResultRaw>(sql, parameters)
                .ToListAsync();

            // Nếu không có kết quả
            if (!rawResults.Any())
            {
                return new PagedResult<HotelDto>
                {
                    Items = new List<HotelDto>(),
                    TotalCount = 0,
                    PageIndex = request.PageIndex,
                    PageSize = request.PageSize
                };
            }

            // Map từ Raw SQL Result sang HotelDto
            var dtos = rawResults.Select(r => new HotelDto
            {
                HotelID = r.HotelID,
                Name = r.Name,
                Slug = r.Slug,
                Address = r.Address,
                LocationID = r.LocationID,
                StarRating = r.StarRating,
                Description = r.Description,
                MapLatitude = r.MapLatitude,
                MapLongitude = r.MapLongitude,
                Status = "Active",
                // Xử lý ảnh: Vì SP chỉ trả về 1 ảnh main, ta đưa nó vào list
                ImageUrls = string.IsNullOrEmpty(r.MainImage) ? new List<string>() : new List<string> { r.MainImage },

                // Mẹo: Bạn có thể thêm 1 trường "StartingPrice" vào HotelDto để hiển thị giá này
                // Hiện tại mình tạm để vào Description để bạn thấy demo
                // Description = $"Giá từ: {r.StartingPrice:N0} VNĐ. {r.Description}" 
            }).ToList();

            return new PagedResult<HotelDto>
            {
                Items = dtos,
                TotalCount = rawResults.First().TotalCount, // Lấy tổng số dòng từ row đầu tiên
                PageIndex = request.PageIndex,
                PageSize = request.PageSize
            };
        }
    }
}