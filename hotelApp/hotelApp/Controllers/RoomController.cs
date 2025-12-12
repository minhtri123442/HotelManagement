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

    [HttpPost("add")]
    public async Task<IActionResult> AddRoom(Room room)
    {
        var res = await _repo.AddRoomAsync(room);
        return Ok(res);
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateRoom(Room room)
    {
        bool ok = await _repo.UpdateRoomAsync(room);
        if (!ok) return NotFound();
        return Ok("Updated");
    }

    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> DeleteRoom(int id)
    {
        bool ok = await _repo.DeleteRoomAsync(id);
        if (!ok) return NotFound();
        return Ok("Deleted");
    }
}
