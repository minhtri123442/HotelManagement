using hotelApp.Models;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Repositories
{
    public class RoomTypeRepository : IRoomTypeRepository
    {
        private readonly HotelContext _context; // Thay HotelDbContext bằng tên DbContext của bạn

        public RoomTypeRepository(HotelContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RoomType>> GetAllByHotelIdAsync(int hotelId)
        {
            return await _context.RoomTypes
                                 .Include(r => r.RoomTypeImages)
                                 .Include(r => r.RoomTypeAmenities)
                                 .Where(r => r.HotelId == hotelId)
                                 .ToListAsync();
        }

        public async Task<RoomType?> GetByIdAsync(int id)
        {
            return await _context.RoomTypes
                                 .Include(r => r.RoomTypeImages)
                                 .Include(r => r.RoomTypeAmenities)
                                 .FirstOrDefaultAsync(r => r.RoomTypeId == id);
        }

        public async Task AddAsync(RoomType roomType)
        {
            await _context.RoomTypes.AddAsync(roomType);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(RoomType roomType)
        {
            _context.RoomTypes.Update(roomType);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var roomType = await _context.RoomTypes.FindAsync(id);
            if (roomType != null)
            {
                _context.RoomTypes.Remove(roomType);
                await _context.SaveChangesAsync();
            }
        }
    }
}