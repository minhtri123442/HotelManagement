using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Options;
using hotelApp.Helpers;
using hotelApp.Models; // Namespace chứa Booking, User

namespace hotelApp.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;

        public EmailService(IOptions<EmailSettings> emailSettings)
        {
            _emailSettings = emailSettings.Value;
        }

        public async Task SendInvoiceEmailAsync(Booking booking, User customer, string roomName)
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SenderEmail));
            email.To.Add(new MailboxAddress(customer.FullName, customer.Email));
            email.Subject = $"[XÁC NHẬN ĐẶT PHÒNG] Mã đơn: #{booking.BookingId} - Đã thành công";

            // Tạo nội dung HTML cho Hóa đơn
            var builder = new BodyBuilder();
            builder.HtmlBody = GetInvoiceHtmlTemplate(booking, customer, roomName);

            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            try
            {
                await smtp.ConnectAsync(_emailSettings.MailServer, _emailSettings.MailPort, MailKit.Security.SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_emailSettings.SenderEmail, _emailSettings.Password);
                await smtp.SendAsync(email);
            }
            catch (Exception ex)
            {
                // Ghi log lỗi nếu cần
                Console.WriteLine($"Lỗi gửi mail: {ex.Message}");
                throw; // Ném lỗi để Controller biết
            }
            finally
            {
                await smtp.DisconnectAsync(true);
            }
        }

        // Hàm helper tạo giao diện Hóa đơn (HTML + CSS Inline)
        private string GetInvoiceHtmlTemplate(Booking booking, User customer, string roomName)
        {
            // Định dạng tiền tệ
            string totalMoney = booking.TotalAmount.ToString("N0") + " VND";
            string checkIn = booking.CheckInDate.ToString("dd/MM/yyyy");
            string checkOut = booking.CheckOutDate.ToString("dd/MM/yyyy");

            return $@"
            <html>
            <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                <div style='max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;'>
                    <h2 style='color: #2563eb; text-align: center;'>CẢM ƠN QUÝ KHÁCH!</h2>
                    <p>Xin chào <strong>{customer.FullName}</strong>,</p>
                    <p>Đơn đặt phòng của bạn tại <strong>Hotel Management</strong> đã được xác nhận thành công.</p>
                    
                    <div style='background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                        <h3 style='margin-top: 0; color: #111827;'>THÔNG TIN ĐẶT PHÒNG</h3>
                        <p><strong>Mã đặt phòng:</strong> #{booking.BookingId}</p>
                        <p><strong>Phòng:</strong> {roomName}</p>
                        <p><strong>Ngày nhận phòng:</strong> {checkIn}</p>
                        <p><strong>Ngày trả phòng:</strong> {checkOut}</p>
                    </div>

                    <div style='text-align: right; margin-top: 20px;'>
                        <p style='font-size: 18px; font-weight: bold;'>TỔNG THANH TOÁN:</p>
                        <p style='font-size: 24px; color: #dc2626; font-weight: bold; margin-top: -10px;'>{totalMoney}</p>
                    </div>

                    <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;' />
                    <p style='font-size: 12px; color: #666; text-align: center;'>
                        Đây là email tự động, vui lòng không trả lời.<br>
                        Nếu cần hỗ trợ, vui lòng liên hệ hotline: 1900 xxxx.
                    </p>
                </div>
            </body>
            </html>";
        }
    }
}