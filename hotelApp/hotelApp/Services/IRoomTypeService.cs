using hotelApp.DTOs;

namespace hotelApp.Services
{
    public interface IRoomTypeService
    {
        // Lấy danh sách(Output: RoomTypeDto)
        Task<IEnumerable<RoomTypeDto>> GetRoomTypesByHotel(int hotelId);

        // Lấy chi tiết (Output: RoomTypeDto)
        Task<RoomTypeDto?> GetRoomTypeById(int id);

        // Tạo mới (Input: RoomTypeCreateDto - CÓ FILE UPLOAD)
        Task<RoomTypeDto> CreateRoomType(RoomTypeCreateDto input);

        // Cập nhật (Tạm thời giữ RoomTypeCreateDto hoặc tạo DTO Update riêng nếu cần)
        // Lưu ý: Nếu chưa làm chức năng Update ảnh, bạn có thể comment dòng này lại để tránh lỗi
        Task UpdateRoomType(int id, RoomTypeUpdateDto input);

        // Xóa
        Task DeleteRoomType(int id);
    }
}