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


            // 1. Chiều hiển thị (Entity -> DTO): Bốc AmenityIds từ bảng trung gian
            CreateMap<RoomType, RoomTypeDto>()
                .ForMember(dest => dest.AmenityIds, opt => opt.MapFrom(src =>
                    src.RoomTypeAmenities.Select(ra => ra.AmenityId).ToList()))
                //Map danh sách ảnh chi tiết
                .ForMember(dest => dest.RoomTypeImages, opt => opt.MapFrom(src => src.RoomTypeImages));

            // 2. Chiều tạo mới (CreateDto -> Entity)
            CreateMap<RoomTypeCreateDto, RoomType>()
                .ForMember(dest => dest.RoomTypeAmenities, opt => opt.Ignore()) 
                .ForMember(dest => dest.RoomTypeImages, opt => opt.Ignore());

            // 3. Chiều cập nhật (UpdateDto -> Entity)
            CreateMap<RoomTypeUpdateDto, RoomType>()
                .ForMember(dest => dest.RoomTypeAmenities, opt => opt.Ignore())
                .ForMember(dest => dest.RoomTypeImages, opt => opt.Ignore());
        }
    }
}