using hotelApp.DTOs;
using hotelApp.Reposities;
using Microsoft.AspNetCore.Mvc;

namespace hotelApp.Controllers
{
    //gọi api cho controller
    [ApiController]
    //đường route để gọi api bên reactjs
    [Route("api/[controller]")]
    public class HotelsController : ControllerBase
    {
        //khai báo biến 
        //gọi IHotelReposity từ 
        private readonly IHotelReposity _repo;
        public HotelsController(IHotelReposity repo) { _repo = repo; }

        [HttpGet]
        public async Task<IActionResult> GetHotels()
        {
            var data = await _repo.GetAllHotelsAsync();
            return Ok(data);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<HotelDto>> Get(int id)
        {
            var hotel =  await _repo.GetHotelByIdAsync(id);
            if (hotel == null) return NotFound();
            return Ok(hotel);
        }
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string keyword)
        {
            var data = await _repo.SearchHotelsAsync(keyword);
            return Ok(data);
        }
    }
}
