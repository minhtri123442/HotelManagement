using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using hotelApp.Models; // Namespace chứa DbContext của bạn
using hotelApp.DTOs;

namespace hotelApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AmenitiesController : ControllerBase
    {
        private readonly HotelContext _context; // Đổi tên theo DbContext thực tế của bạn

        public AmenitiesController(HotelContext context)
        {
            _context = context;
        }

        // GET: api/Amenities
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Amenity>>> GetAmenities()
        {
            return await _context.Amenities.ToListAsync();
        }

        // GET: api/Amenities/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Amenity>> GetAmenity(int id)
        {
            var amenity = await _context.Amenities.FindAsync(id);
            if (amenity == null) return NotFound();
            return amenity;
        }

        // POST: api/Amenities
        [HttpPost]
        public async Task<ActionResult<Amenity>> PostAmenity(AmenityDto dto)
        {
            var amenity = new Amenity
            {
                Name = dto.Name,
                IconClass = dto.IconClass,
                Type = dto.Type
            };

            _context.Amenities.Add(amenity);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAmenity", new { id = amenity.AmenityId }, amenity);
        }

        // PUT: api/Amenities/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAmenity(int id, AmenityDto dto)
        {
            if (id != dto.AmenityId) return BadRequest("ID không khớp");

            var amenity = await _context.Amenities.FindAsync(id);
            if (amenity == null) return NotFound();

            // Cập nhật thông tin
            amenity.Name = dto.Name;
            amenity.IconClass = dto.IconClass;
            amenity.Type = dto.Type;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AmenityExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // DELETE: api/Amenities/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAmenity(int id)
        {
            var amenity = await _context.Amenities.FindAsync(id);
            if (amenity == null) return NotFound();

            _context.Amenities.Remove(amenity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AmenityExists(int id)
        {
            return _context.Amenities.Any(e => e.AmenityId == id);
        }
    }
}