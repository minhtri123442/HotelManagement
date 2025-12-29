using hotelApp.DTOs;
using hotelApp.Models;
using hotelApp.Repositories;

namespace hotelApp.Services
{
    public class RoomTypeService : IRoomTypeService
    {
        private readonly IRoomTypeRepository _repo;

        public RoomTypeService(IRoomTypeRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<RoomTypeDto>> GetRoomTypesByHotel(int hotelId)
        {
            var rooms = await _repo.GetAllByHotelIdAsync(hotelId);
            // Map Entity -> DTO
            return rooms.Select(r => MapToDto(r)).ToList();
        }

        public async Task<RoomTypeDto> CreateRoomType(RoomTypeCreateDto input)
        {
            // Chỉ xử lý Text, không xử lý ảnh ở đây (Controller làm việc đó)
            var newRoom = new RoomType
            {
                HotelId = input.HotelID,
                Name = input.Name,
                BasePrice = input.BasePrice,
                Description = input.Description,
                MaxAdults = input.MaxAdults,
                MaxChildren = input.MaxChildren,
                RoomArea = input.RoomArea,
                BedType = input.BedType,
                Quantity = input.Quantity,
                ThumbnailUrl = null,
                RoomTypeImages = new List<RoomTypeImage>()
            };

            await _repo.AddAsync(newRoom);
            return await GetRoomTypeById(newRoom.RoomTypeId);
        }

        // Overload nếu cần dùng DTO thường
        public async Task<RoomTypeDto> CreateRoomType(RoomTypeDto input)
        {
            var newRoom = new RoomType
            {
                HotelId = input.HotelID,
                Name = input.Name,
                BasePrice = input.BasePrice,
                Description = input.Description,
                MaxAdults = input.MaxAdults,
                MaxChildren = input.MaxChildren,
                RoomArea = input.RoomArea,
                BedType = input.BedType,
                Quantity = input.Quantity,
                ThumbnailUrl = input.ThumbnailUrl
            };
            await _repo.AddAsync(newRoom);
            return await GetRoomTypeById(newRoom.RoomTypeId);
        }

        public async Task UpdateRoomType(int id, RoomTypeUpdateDto input)
        {
            var existingRoom = await _repo.GetByIdAsync(id);
            if (existingRoom == null) throw new Exception("Không tìm thấy loại phòng.");

            // Chỉ update Text
            existingRoom.Name = input.Name;
            existingRoom.BasePrice = input.BasePrice;
            existingRoom.Description = input.Description;
            existingRoom.MaxAdults = input.MaxAdults;
            existingRoom.MaxChildren = input.MaxChildren;
            existingRoom.RoomArea = input.RoomArea;
            existingRoom.BedType = input.BedType;
            existingRoom.Quantity = input.Quantity;

            await _repo.UpdateAsync(existingRoom);
        }

        public async Task DeleteRoomType(int id)
        {
            await _repo.DeleteAsync(id);
        }

        public async Task<RoomTypeDto?> GetRoomTypeById(int id)
        {
            var r = await _repo.GetByIdAsync(id);
            return r == null ? null : MapToDto(r);
        }

        // Hàm phụ để map dữ liệu
        private RoomTypeDto MapToDto(RoomType r)
        {
            return new RoomTypeDto
            {
                RoomTypeID = r.RoomTypeId,
                HotelID = r.HotelId,
                Name = r.Name,
                BasePrice = r.BasePrice,
                MaxAdults = r.MaxAdults ?? 0,
                MaxChildren = r.MaxChildren ?? 0,
                RoomArea = r.RoomArea,
                BedType = r.BedType,
                Quantity = r.Quantity ?? 0,
                ThumbnailUrl = r.ThumbnailUrl,
                Description = r.Description,
                RoomTypeImages = r.RoomTypeImages?.Select(img => new RoomTypeImageDto
                {
                    RoomImageID = img.RoomImageId,
                    ImageUrl = img.ImageUrl,
                    Caption = img.Caption
                }).ToList() ?? new List<RoomTypeImageDto>()
            };
        }
    }
}