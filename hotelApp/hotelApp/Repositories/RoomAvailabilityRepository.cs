using hotelApp.Models;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Repositories
{

    public class RoomAvailabilityRepository : IRoomAvailabilityRepository
    {
        private readonly HotelContext _context;

        public RoomAvailabilityRepository(HotelContext context)
        {
            _context = context;
        }

        public async Task<List<RoomAvailability>> GetByDateRangeAsync(int roomTypeId, DateOnly fromDate, DateOnly toDate)
        {
            return await _context.RoomAvailabilities
                .Where(x => x.RoomTypeId == roomTypeId && x.Date >= fromDate && x.Date <= toDate)
                .ToListAsync();
        }

        public async Task<RoomAvailability?> GetByDateAsync(int roomTypeId, DateOnly date)
        {
            return await _context.RoomAvailabilities
                .FirstOrDefaultAsync(x => x.RoomTypeId == roomTypeId && x.Date == date);
        }

        public async Task AddAsync(RoomAvailability entity) => await _context.RoomAvailabilities.AddAsync(entity);
        public Task UpdateAsync(RoomAvailability entity)
        {
            _context.RoomAvailabilities.Update(entity);
            return Task.CompletedTask;
        }
        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }
}
