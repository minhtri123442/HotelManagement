using hotelApp.DTOs;
using hotelApp.Models;

namespace hotelApp.Repositories
{
    public interface IHotelRepository
    {
        // --- READ ---
        // Lấy danh sách cho Admin (có phân trang)
        Task<PagedResult<HotelDto>> GetAllHotelsAsync(int pageIndex, int pageSize);

        // Lấy chi tiết để hiển thị (trả về DTO)
        Task<HotelDto> GetHotelDtoByIdAsync(int id);

        // Lấy Entity gốc để dùng cho việc Update (tránh mapping ngược)
        Task<Hotel> GetHotelEntityByIdAsync(int id);

        // --- WRITE ---
        Task<Hotel> AddHotelAsync(Hotel hotel);
        Task<Hotel> UpdateHotelAsync(Hotel hotel);
        Task<bool> DeleteHotelAsync(int id); // Soft Delete (Chuyển Status)

        // --- SEARCH (Phức tạp) ---
        Task<PagedResult<HotelDto>> SearchHotelsAsync(HotelSearchRequest request);
        Task<List<Location>> GetLocationsAsync();
    }
}
