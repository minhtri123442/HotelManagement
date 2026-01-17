using hotelApp.Models; // Namespace chứa Model User
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net; // Cần cài gói: BCrypt.Net-Next

namespace hotelApp.Controllers
{
    // DTO cho Đăng nhập
    public class LoginDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    // DTO cho Đăng ký (Register)
    public class RegisterDto
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Password { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly HotelContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(HotelContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // ================== ĐĂNG KÝ (REGISTER) ==================
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterDto dto)
        {
            // 1. Check email trùng
            if (_context.Users.Any(u => u.Email == dto.Email))
            {
                return BadRequest("Email này đã được sử dụng.");
            }

            // 2. Hash mật khẩu (QUAN TRỌNG)
            // Lưu ý: Phải hash để Login verify được
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // 3. Tạo User mới
            var newUser = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                PasswordHash = passwordHash, // Lưu chuỗi đã mã hóa
                Role = "Customer", // Mặc định là khách
                CreatedAt = DateTime.Now
            };

            _context.Users.Add(newUser);
            _context.SaveChanges();

            return Ok("Đăng ký thành công!");
        }

        // ================== ĐĂNG NHẬP (LOGIN) ==================
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto login)
        {
            // 1. Tìm User trong bảng duy nhất: Users
            var user = _context.Users.FirstOrDefault(u => u.Email == login.Email);

            // 2. Check User tồn tại
            if (user == null)
            {
                return Unauthorized("Tài khoản không tồn tại.");
            }

            // 3. Check Mật khẩu (Hỗ trợ cả Hash và Không Hash để tránh lỗi 500 với data cũ)
            bool isValidPassword = false;

            try
            {
                // Thử Verify theo kiểu Hash (Dành cho user mới đăng ký)
                isValidPassword = BCrypt.Net.BCrypt.Verify(login.Password, user.PasswordHash);
            }
            catch
            {
                // Nếu Verify lỗi (do data cũ lưu pass thô "123456"), fallback về so sánh thường
                // *Khuyến cáo: Sau này nên reset hết pass về dạng hash*
                if (user.PasswordHash == login.Password)
                {
                    isValidPassword = true;
                }
            }

            if (!isValidPassword)
            {
                return Unauthorized("Mật khẩu không chính xác.");
            }

            // 4. Tạo Token (Phần này giữ nguyên logic cũ của bro)
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];

            if (string.IsNullOrEmpty(jwtKey)) return StatusCode(500, "Server Error: Jwt Config Missing");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role ?? "Customer"), // Lấy Role từ DB (Admin/Customer)
                new Claim("FullName", user.FullName ?? "User")
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: credentials);

            var jwtToken = new JwtSecurityTokenHandler().WriteToken(token);

            // 5. Trả về kết quả
            return Ok(new
            {
                token = jwtToken,
                id = user.UserId,       // Frontend cần cái này
                fullName = user.FullName,
                role = user.Role        // Frontend cần cái này để redirect
            });
        }
    }
}