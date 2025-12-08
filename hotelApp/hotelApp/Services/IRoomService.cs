using hotelApp.DTOs;

namespace hotelApp.Services
{
    public interface IRoomService
    {
        Task<IEnumerable<RoomDto>> GetAllAsync(int? hotelId = null);
        Task<RoomDto?> GetByIdAsync(int id);
        Task<RoomDto> CreateAsync(RoomDto dto);
        Task<bool> UpdateAsync(int id, RoomDto dto);
        Task<bool> DeleteAsync(int id);
    }

}
