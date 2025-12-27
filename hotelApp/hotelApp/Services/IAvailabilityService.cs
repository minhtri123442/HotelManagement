using hotelApp.DTOs;

namespace hotelApp.Services
{
    public interface IAvailabilityService
    {
        Task<List<CalendarDto>> GetCalendarAsync(int roomTypeId, int month, int year);
        Task BulkUpdateAsync(BulkUpdateDto input);
    }
}
