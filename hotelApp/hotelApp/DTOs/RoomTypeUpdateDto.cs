namespace hotelApp.DTOs
{
    // Kế thừa RoomTypeCreateDto để tận dụng lại các trường Name, Price, và đặc biệt là IFormFile
    public class RoomTypeUpdateDto : RoomTypeCreateDto
    {
        // Thêm ID để Backend biết đang sửa bản ghi nào
        public int RoomTypeID { get; set; }
    }
}