using AutoMapper;
using hotelApp.DTOs;
using hotelApp.Models;
namespace hotelApp.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Room, RoomDto>().ReverseMap();
            // add other maps...
        }
    }
}
