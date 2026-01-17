using hotelApp.Models;
using Microsoft.EntityFrameworkCore;

namespace hotelApp.Repositories
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetUsersByRoleAsync(string role, string? keyword);
        Task<User?> GetByIdAsync(int id);
        Task<User> AddAsync(User user);
        Task UpdateAsync(User user);
        Task<bool> DeleteAsync(int id);
        Task<bool> IsEmailExists(string email);
    }
    public class UserRepository : IUserRepository
    {
        private readonly HotelContext _context;

        public UserRepository(HotelContext context)
        {
            _context = context;
        }

        // Lấy danh sách theo Role (Customer/Admin/...)
        public async Task<IEnumerable<User>> GetUsersByRoleAsync(string role, string? keyword)
        {
            var query = _context.Users.Where(u => u.Role == role).AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
            {
                var k = keyword.ToLower();
                query = query.Where(u => (u.FullName != null && u.FullName.ToLower().Contains(k))
                                      || u.Email.ToLower().Contains(k));
            }

            return await query.OrderByDescending(u => u.CreatedAt).ToListAsync();
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User> AddAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsEmailExists(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }
    }
}

