using hotelApp.DTOs;

namespace hotelApp.Reposities
{
    public interface IHotelReposity
    {
        Task<List<HotelDto>> GetAllHotelsAsync();
        Task<HotelDto> GetHotelByIdAsync(int id);
        Task<IEnumerable<HotelDto>> SearchHotelsAsync(string keyword);

    }
}
