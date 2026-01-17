using hotelApp.Models; 

namespace hotelApp.Services
{
    public interface IEmailService
    {
        Task SendInvoiceEmailAsync(Booking booking, User customer, string roomName);
    }
}