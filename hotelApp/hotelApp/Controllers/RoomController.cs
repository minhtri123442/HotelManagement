using hotelApp.Models;
using hotelApp.Reposities;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class RoomController : ControllerBase
{
    private readonly RoomRepository _repo;

    public RoomController(RoomRepository repo)
    {
        _repo = repo;
    }

    [HttpGet("list")]
    public async Task<IActionResult> GetRooms()
    {
        return Ok(await _repo.GetRoomsAsync());
    }

    

    [HttpPut("update")]
    public async Task<IActionResult> UpdateRoom(Room room)
    {
        bool ok = await _repo.UpdateRoomAsync(room);
        if (!ok) return NotFound();
        return Ok("Updated");
    }
    [HttpGet("by-hotel/{hotelId}")]
    public async Task<IActionResult> GetRoomsByHotel(int hotelId)
    {
        var rooms = await _repo.GetRoomsByHotelAsync(hotelId);
        return Ok(rooms);
    }


}
