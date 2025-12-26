using AutoMapper;
using hotelApp.DTOs;
using hotelApp.Models;

namespace hotelApp.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {

            // 1. Chiều hiển thị (Entity -> DTO)
            CreateMap<Hotel, HotelDto>()
                .ForMember(dest => dest.ImageUrls, opt => opt.MapFrom(src =>
                    src.HotelImages.OrderByDescending(i => i.IsMain).Select(i => i.ImageUrl).ToList()));

            // 2. Chiều lưu dữ liệu (DTO -> Entity)
            CreateMap<HotelDto, Hotel>()
                .ForMember(dest => dest.HotelImages, opt => opt.Ignore())
                .ForMember(dest => dest.CheckInTime, opt => opt.MapFrom(src =>
                    !string.IsNullOrEmpty(src.CheckInTime) ? TimeOnly.Parse(src.CheckInTime) : TimeOnly.MinValue))
                .ForMember(dest => dest.CheckOutTime, opt => opt.MapFrom(src =>
                    !string.IsNullOrEmpty(src.CheckOutTime) ? TimeOnly.Parse(src.CheckOutTime) : TimeOnly.MinValue));

            // mapping cho HotelCreateDto
            CreateMap<HotelCreateDto, Hotel>()
                .ForMember(dest => dest.HotelImages, opt => opt.Ignore())
                .ForMember(dest => dest.CheckInTime, opt => opt.MapFrom(src =>
                    !string.IsNullOrEmpty(src.CheckInTime) ? TimeOnly.Parse(src.CheckInTime) : TimeOnly.MinValue))
                .ForMember(dest => dest.CheckOutTime, opt => opt.MapFrom(src =>
                    !string.IsNullOrEmpty(src.CheckOutTime) ? TimeOnly.Parse(src.CheckOutTime) : TimeOnly.MinValue));

            CreateMap<HotelUpdateDto, Hotel>();
            //Mapping cho roomType
            CreateMap<RoomType, RoomTypeDto>().ReverseMap();
        }
    }
}