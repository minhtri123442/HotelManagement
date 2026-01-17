using System.ComponentModel.DataAnnotations;

namespace hotelApp.DTOs
{
    // DTO hiển thị ra danh sách
    public class CustomerDto
    {
        public int UserId { get; set; }
        public string? FullName { get; set; }
        public string Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string Role { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    // DTO để tạo mới
    public class CustomerCreateDto
    {
        [Required]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; } // Nhập pass thường, backend sẽ hash

        public string? PhoneNumber { get; set; }
    }

    // DTO để cập nhật
    public class CustomerUpdateDto
    {
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        // Thường không cho đổi Email/Password ở API update thông thường
    }
}