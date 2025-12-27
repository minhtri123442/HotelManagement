using hotelApp.Models;

namespace hotelApp.Repositories
{
    public interface IRoomAvailabilityRepository
    {
        // Lấy dữ liệu trong khoảng ngày (thường là 1 tháng)
        Task<List<RoomAvailability>> GetByDateRangeAsync(int roomTypeId, DateOnly fromDate, DateOnly toDate);

        // Tìm 1 ngày cụ thể
        Task<RoomAvailability?> GetByDateAsync(int roomTypeId, DateOnly date);

        Task AddAsync(RoomAvailability entity);
        Task UpdateAsync(RoomAvailability entity);
        Task SaveChangesAsync();
    }
}
