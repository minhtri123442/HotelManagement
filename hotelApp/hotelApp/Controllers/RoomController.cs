using hotelApp.DTOs;
using hotelApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace hotelApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly IRoomService _service;
        public RoomsController(IRoomService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? hotelId) =>
            Ok(await _service.GetAllAsync(hotelId));

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var r = await _service.GetByIdAsync(id);
            if (r == null) return NotFound();
            return Ok(r);
        }

        [HttpPost]
        public async Task<IActionResult> Create(RoomDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.RoomID }, created);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, RoomDto dto)
        {
            var ok = await _service.UpdateAsync(id, dto);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _service.DeleteAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }
    }

}
