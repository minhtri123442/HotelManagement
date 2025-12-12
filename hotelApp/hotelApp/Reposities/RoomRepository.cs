using hotelApp.DTOs;
using hotelApp.Models;
using Microsoft.EntityFrameworkCore;
namespace hotelApp.Reposities
{
    public class RoomRepository
    {
        private readonly HotelContext _db;

        public RoomRepository(HotelContext db)
        {
            _db = db;
        }

        // Lấy danh sách phòng
        public async Task<List<RoomDto>> GetRoomsAsync()
        {
            return await _db.Rooms
                .Include(r => r.Hotel)
                .Include(r => r.RoomType)
                .Select(r => new RoomDto
                {
                    RoomID = r.RoomId,
                    RoomCode = r.RoomCode,
                    RoomNumber = r.RoomNumber,
                    HotelName = r.Hotel.Name,
                    RoomTypeName = r.RoomType.TypeName,
                    Floor = r.Floor,
                    Status = r.Status,
                    Note = r.Note,
                    ImageUrl = r.ImageUrl
                })
                .ToListAsync();
        }

        // Tự tạo mã phòng
        public string GenerateRoomCode()
        {
            int count = _db.Rooms.Count() + 1;
            return "RM" + count.ToString("000");
        }

        // Thêm phòng
        public async Task<Room> AddRoomAsync(Room room)
        {
            room.RoomCode = GenerateRoomCode();
            _db.Rooms.Add(room);
            await _db.SaveChangesAsync();
            return room;
        }

        // Sửa phòng
        public async Task<bool> UpdateRoomAsync(Room updated)
        {
            var room = await _db.Rooms.FindAsync(updated.RoomId);
            if (room == null) return false;

            room.RoomNumber = updated.RoomNumber;
            room.RoomType = updated.RoomType;
            room.HotelId = updated.HotelId;
            room.Floor = updated.Floor;
            room.Status = updated.Status;
            room.Note = updated.Note;
            room.ImageUrl = updated.ImageUrl;
            await _db.SaveChangesAsync();
            return true;
        }

        // Xóa phòng
        public async Task<bool> DeleteRoomAsync(int id)
        {
            var room = await _db.Rooms.FindAsync(id);
            if (room == null) return false;

            _db.Rooms.Remove(room);
            await _db.SaveChangesAsync();
            return true;
        }
    }

}
