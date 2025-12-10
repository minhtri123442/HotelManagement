using AutoMapper;
using hotelApp.DTOs;
using hotelApp.Models;
using hotelApp.Services;
using Microsoft.EntityFrameworkCore;
namespace hotelApp.Reposities
{
    public class HotelReposity : IHotelReposity
    {
        private readonly HotelContext _db;
        public HotelReposity(HotelContext db) { _db = db; }
        public async Task<List<HotelDto>> GetAllHotelsAsync()
        {
            var hotels = await _db.Hotels
                .Include(h => h.HotelImages)
                .OrderBy(h => h.HotelId)
                .ToListAsync();

            return hotels.Select(h => new HotelDto
            {
                HotelID = h.HotelId,
                HotelCode = h.HotelCode,
                Name = h.Name,
                Address = h.Address,
                City = h.City,
                Country = h.Country,
                Phone = h.Phone,
                Email = h.Email,
                Description = h.Description,
                Status = h.Status,
                MainImageUrl = h.MainImageUrl,
                CreatedAt = h.CreatedAt,

                Images = h.HotelImages
                    .OrderBy(i => i.ImageId)
                    .Select(i => i.ImageUrl)
                    .ToList()
            }).ToList();
        }
        //lấy ks theo id
        public async Task<HotelDto> GetHotelByIdAsync(int id)
        {
            var h = await _db.Hotels.Include(x => x.HotelImages)
                .FirstOrDefaultAsync(x => x.HotelId == id);
            if (h == null) return null;
            return new HotelDto
            {
                HotelID = h.HotelId,
                HotelCode = h.HotelCode,
                Name = h.Name,
                Address = h.Address,
                City = h.City,
                Country = h.Country,
                Phone = h.Phone,
                Email = h.Email,
                Description = h.Description,
                Status = h.Status,
                MainImageUrl = h.MainImageUrl,
                CreatedAt = h.CreatedAt,
                Images = h.HotelImages
        .OrderBy(i => i.ImageId)
        .Select(i => i.ImageUrl)
        .ToList()
            };

        }

        public async Task<IEnumerable<HotelDto>> SearchHotelsAsync(string keyword)
        {
            keyword = keyword?.Trim() ?? "";

            // Nếu rỗng thì trả về toàn bộ
            if (string.IsNullOrEmpty(keyword))
            {
                return await GetAllHotelsAsync();
            }

            // Áp dụng COLLATE để bỏ dấu + không phân biệt hoa thường
            var hotels = await _db.Hotels
                .Include(h => h.HotelImages)
                .Where(h =>
                    EF.Functions.Like(
                        EF.Functions.Collate(h.Name, "Latin1_General_CI_AI"), $"%{keyword}%"
                    ) ||
                    EF.Functions.Like(
                        EF.Functions.Collate(h.HotelCode, "Latin1_General_CI_AI"), $"%{keyword}%"
                    ) ||
                    EF.Functions.Like(
                        EF.Functions.Collate(h.City, "Latin1_General_CI_AI"), $"%{keyword}%"
                    )
                )
                .OrderBy(h => h.HotelId)
                .ToListAsync();

            return hotels.Select(h => new HotelDto
            {
                HotelID = h.HotelId,
                HotelCode = h.HotelCode,
                Name = h.Name,
                Address = h.Address,
                City = h.City,
                Country = h.Country,
                Phone = h.Phone,
                Email = h.Email,
                Description = h.Description,
                Status = h.Status,
                MainImageUrl = h.MainImageUrl,
                CreatedAt = h.CreatedAt,
                Images = h.HotelImages
                    .OrderBy(i => i.ImageId)
                    .Select(i => i.ImageUrl)
                    .ToList()
            });
        }



    }
}
