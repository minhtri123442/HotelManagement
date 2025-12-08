namespace hotelApp.DTOs
{
    public class RoomDto
    {
        public int RoomID { get; set; }
        public string RoomCode { get; set; }
        public string RoomNumber { get; set; }
        public int RoomTypeID { get; set; }
        public int? HotelID { get; set; }
        public string Status { get; set; }
        public string Note { get; set; }
    }

}
