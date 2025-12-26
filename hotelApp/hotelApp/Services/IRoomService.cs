using hotelApp.DTOs;

namespace hotelApp.Services
{
    public interface IRoomService
    {
        Task<IEnumerable<RoomTypeDto>> GetAllAsync(int? hotelId = null);
        Task<RoomTypeDto?> GetByIdAsync(int id);
        Task<RoomTypeDto> CreateAsync(RoomTypeDto dto);
        Task<bool> UpdateAsync(int id, RoomTypeDto dto);
        Task<bool> DeleteAsync(int id);
    }

}
