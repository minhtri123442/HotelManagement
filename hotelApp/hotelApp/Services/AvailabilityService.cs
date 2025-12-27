using hotelApp.DTOs;
using hotelApp.Models;
using hotelApp.Repositories;

namespace hotelApp.Services
{
    public class AvailabilityService : IAvailabilityService
    {
        private readonly IRoomAvailabilityRepository _repo;
        private readonly IRoomTypeRepository _roomRepo;

        public AvailabilityService(IRoomAvailabilityRepository repo, IRoomTypeRepository roomRepo)
        {
            _repo = repo;
            _roomRepo = roomRepo;
        }

        public async Task<List<CalendarDto>> GetCalendarAsync(int roomTypeId, int month, int year)
        {
            var fromDate = new DateOnly(year, month, 1);
            var toDate = fromDate.AddMonths(1).AddDays(-1);

            var data = await _repo.GetByDateRangeAsync(roomTypeId, fromDate, toDate);

            return data.Select(x => new CalendarDto
            {
                Date = x.Date,
                Price = x.Price,
                AvailableQty = x.AvailableQty,
                IsClosed = x.IsClosed??false
            }).ToList();
        }

        public async Task BulkUpdateAsync(BulkUpdateDto input)
        {
            // BƯỚC 1: Chuyển đổi Input (DateTime) sang DateOnly
            var startDate = input.FromDate;
            var endDate = input.ToDate;

            // BƯỚC 2: Duyệt vòng lặp bằng biến DateOnly
            // Lưu ý: DateOnly cũng có hàm .AddDays(1)
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                var record = await _repo.GetByDateAsync(input.RoomTypeID, date);

                if (record == null)
                {
                    // Nếu chưa có -> Tạo mới
                    var roomType = await _roomRepo.GetByIdAsync(input.RoomTypeID);
                    if (roomType == null) throw new Exception("Room Type not found");

                    record = new RoomAvailability
                    {
                        RoomTypeId = input.RoomTypeID,
                        Date = date,
                        Price = input.Price ?? roomType.BasePrice,
                        AvailableQty = input.AvailableQty ?? (roomType.Quantity ?? 0),
                        IsClosed = input.IsClosed ?? false
                    };
                    await _repo.AddAsync(record);
                }
                else
                {
                    // Nếu có rồi -> Cập nhật
                    if (input.Price.HasValue) record.Price = input.Price.Value;
                    if (input.AvailableQty.HasValue) record.AvailableQty = input.AvailableQty.Value;
                    if (input.IsClosed.HasValue) record.IsClosed = input.IsClosed.Value;

                    await _repo.UpdateAsync(record);
                }
            }
            await _repo.SaveChangesAsync();
        }
    }
}