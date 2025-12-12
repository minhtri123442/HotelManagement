namespace hotelApp.DTOs
{
    public class RoomDto
    {
        public int RoomID { get; set; }
        public string RoomCode { get; set; }
        public string RoomNumber { get; set; }
        public string HotelName { get; set; }
        public string RoomTypeName { get; set; }
        public int? Floor { get; set; }
        public string Status { get; set; }
        public string Note { get; set; }
        public string ImageUrl {  get; set; }
    }


}
