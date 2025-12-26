using hotelApp.DTOs;
using hotelApp.Models;
using hotelApp.Repositories;
using Microsoft.AspNetCore.Hosting; // Cần cái này để lấy đường dẫn wwwroot
using Microsoft.AspNetCore.Http;

namespace hotelApp.Services
{
    public class RoomTypeService : IRoomTypeService
    {
        private readonly IRoomTypeRepository _repo;
        private readonly IWebHostEnvironment _env; // Môi trường hosting

        // Inject thêm IWebHostEnvironment
        public RoomTypeService(IRoomTypeRepository repo, IWebHostEnvironment env)
        {
            _repo = repo;
            _env = env;
        }

        private async Task<string> SaveFileAsync(IFormFile file, string folderName)
        {
            if (file == null || file.Length == 0) return null;

            // Tạo tên file ngẫu nhiên để tránh trùng (dùng GUID)
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

            // Xác định đường dẫn: wwwroot/Hotel_Image/{folderName}
            var rootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadPath = Path.Combine(rootPath, "Hotel_Image", folderName);

            // Tạo thư mục nếu chưa có
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            // Lưu file vào ổ cứng
            var filePath = Path.Combine(uploadPath, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Trả về đường dẫn tương đối để lưu vào DB
            // Kết quả dạng: "RoomThumbnails/abc-xyz.jpg"
            return $"{folderName}/{fileName}";
        }

        // Lấy danh sách phòng theo HotelID
        public async Task<IEnumerable<RoomTypeDto>> GetRoomTypesByHotel(int hotelId)
        {
            var rooms = await _repo.GetAllByHotelIdAsync(hotelId);

            // Map Entity -> DTO
            return rooms.Select(r => new RoomTypeDto
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

                // Map danh sách ảnh
                RoomTypeImages = r.RoomTypeImages?.Select(img => new RoomTypeImageDto
                {
                    RoomImageID = img.RoomImageId,
                    ImageUrl = img.ImageUrl,
                    Caption = img.Caption
                }).ToList() ?? new List<RoomTypeImageDto>()
            }).ToList();
        }

        // --- HÀM CREATE (ĐÃ SỬA ĐỔI) ---
        public async Task<RoomTypeDto> CreateRoomType(RoomTypeCreateDto input)
        {
            // 1. Xử lý ảnh Thumbnail
            string thumbPath = null;
            if (input.ThumbnailImage != null)
            {
                thumbPath = await SaveFileAsync(input.ThumbnailImage, "RoomThumbnails");
            }

            // 2. Map dữ liệu sang Entity
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
                ThumbnailUrl = thumbPath, // Lưu đường dẫn file vừa upload

                // Khởi tạo list rỗng để chuẩn bị thêm ảnh con
                RoomTypeImages = new List<RoomTypeImage>()
            };

            // 3. Xử lý danh sách ảnh phụ (Gallery)
            if (input.GalleryImages != null && input.GalleryImages.Count > 0)
            {
                foreach (var file in input.GalleryImages)
                {
                    var imgPath = await SaveFileAsync(file, "RoomDetails");
                    if (imgPath != null)
                    {
                        newRoom.RoomTypeImages.Add(new RoomTypeImage
                        {
                            ImageUrl = imgPath,
                            Caption = "Chi tiết" // Bạn có thể để mặc định hoặc mở rộng DTO để nhập caption
                        });
                    }
                }
            }

            // 4. Lưu vào Database
            await _repo.AddAsync(newRoom);

            // 5. Trả về kết quả đầy đủ (Gọi lại hàm GetById để map ra DTO chuẩn)
            return await GetRoomTypeById(newRoom.RoomTypeId);
        }

        // Các hàm Create, Update, Delete giữ nguyên logic cơ bản
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
                ThumbnailUrl = input.ThumbnailUrl,

                // --- Map danh sách ảnh phụ ---
                // Kiểm tra xem input có ảnh phụ không, nếu có thì map sang Entity
                RoomTypeImages = input.RoomTypeImages?.Select(img => new RoomTypeImage
                {
                    // Không map RoomImageID vì đây là tạo mới, DB tự sinh
                    ImageUrl = img.ImageUrl,
                    Caption = img.Caption
                }).ToList()
            };

            // Khi AddAsync, EF Core sẽ tự động thêm cả RoomType và list RoomTypeImages vào DB
            await _repo.AddAsync(newRoom);

            // Trả về kết quả đầy đủ
            return await GetRoomTypeById(newRoom.RoomTypeId);
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

        // Hàm phụ để map cho gọn code
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
        // HÀM PHỤ: Xóa file vật lý để dọn rác
        private void DeleteFile(string relativePath)
        {
            if (string.IsNullOrEmpty(relativePath)) return;

            var rootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            // Đường dẫn trong DB: "RoomThumbnails/abc.jpg" -> Cần map ra đường dẫn tuyệt đối
            var fullPath = Path.Combine(rootPath, "Hotel_Image", relativePath.Replace("/", "\\"));

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }
        // --- IMPLEMENT CHỨC NĂNG UPDATE ---
        public async Task UpdateRoomType(int id, RoomTypeUpdateDto input)
        {
            // 1. Lấy dữ liệu cũ từ DB
            var existingRoom = await _repo.GetByIdAsync(id);
            if (existingRoom == null)
            {
                throw new Exception("Không tìm thấy loại phòng này.");
            }

            // 2. Cập nhật thông tin cơ bản (Scalar)
            existingRoom.Name = input.Name;
            existingRoom.BasePrice = input.BasePrice;
            existingRoom.Description = input.Description;
            existingRoom.MaxAdults = input.MaxAdults;
            existingRoom.MaxChildren = input.MaxChildren;
            existingRoom.RoomArea = input.RoomArea;
            existingRoom.BedType = input.BedType;
            existingRoom.Quantity = input.Quantity;
            // Lưu ý: HotelId thường không cho sửa, nếu cần thì gán: existingRoom.HotelId = input.HotelID;

            // 3. Xử lý Ảnh Thumbnail (Nếu user chọn ảnh mới)
            if (input.ThumbnailImage != null)
            {
                // 3.1. Xóa ảnh cũ để tránh rác
                DeleteFile(existingRoom.ThumbnailUrl);

                // 3.2. Lưu ảnh mới
                existingRoom.ThumbnailUrl = await SaveFileAsync(input.ThumbnailImage, "RoomThumbnails");
            }

            // 4. Xử lý Ảnh Gallery (Thêm ảnh mới vào danh sách cũ)
            // Nếu muốn xóa ảnh cũ trong Gallery, thường ta làm API "DeleteImage" riêng ở giao diện
            if (input.GalleryImages != null && input.GalleryImages.Count > 0)
            {
                if (existingRoom.RoomTypeImages == null)
                    existingRoom.RoomTypeImages = new List<RoomTypeImage>();

                foreach (var file in input.GalleryImages)
                {
                    var imgPath = await SaveFileAsync(file, "RoomDetails");
                    if (imgPath != null)
                    {
                        existingRoom.RoomTypeImages.Add(new RoomTypeImage
                        {
                            ImageUrl = imgPath,
                            Caption = "Chi tiết (Mới)"
                        });
                    }
                }
            }

            // 5. Lưu xuống DB
            await _repo.UpdateAsync(existingRoom);
        }
    }
}