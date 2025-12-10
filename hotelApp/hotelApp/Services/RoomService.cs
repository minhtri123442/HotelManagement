using AutoMapper;
using hotelApp.DTOs;
using hotelApp.Models;
using hotelApp.Services;
using Microsoft.EntityFrameworkCore;

public class RoomService : IRoomService
{
    private readonly HotelContext _db;
    private readonly IMapper _mapper;

    public RoomService(HotelContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<IEnumerable<RoomDto>> GetAllAsync(int? hotelId = null)
    {
        var q = _db.Rooms.AsQueryable();
        if (hotelId.HasValue) q = q.Where(r => r.HotelId == hotelId.Value);
        var list = await q.ToListAsync();
        return _mapper.Map<IEnumerable<RoomDto>>(list);
    }

    public async Task<RoomDto?> GetByIdAsync(int id)
    {
        var r = await _db.Rooms.FindAsync(id);
        return r == null ? null : _mapper.Map<RoomDto>(r);
    }

    public async Task<RoomDto> CreateAsync(RoomDto dto)
    {
        var entity = _mapper.Map<Room>(dto);
        _db.Rooms.Add(entity);
        await _db.SaveChangesAsync();
        return _mapper.Map<RoomDto>(entity);
    }

    public async Task<bool> UpdateAsync(int id, RoomDto dto)
    {
        var exist = await _db.Rooms.FindAsync(id);
        if (exist == null) return false;
        _mapper.Map(dto, exist);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var e = await _db.Rooms.FindAsync(id);
        if (e == null) return false;
        _db.Rooms.Remove(e);
        await _db.SaveChangesAsync();
        return true;
    }
}
