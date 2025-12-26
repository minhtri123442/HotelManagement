using hotelApp.DTOs;
using hotelApp.Models;

namespace hotelApp.Repositories
{
    // Chú ý từ khóa 'interface' (không phải class)
    public interface IRoomTypeRepository
    {
        // 1. Lấy danh sách (Trả về Entity)
        Task<IEnumerable<RoomType>> GetAllByHotelIdAsync(int hotelId);

        // 2. Lấy chi tiết (Trả về Entity)
        Task<RoomType?> GetByIdAsync(int id);

        // 3. Thêm (Nhận vào Entity)
        Task AddAsync(RoomType roomType);

        // 4. Sửa (Nhận vào Entity)
        Task UpdateAsync(RoomType roomType);

        // 5. Xóa (Nhận vào ID)
        Task DeleteAsync(int id);


    }
}