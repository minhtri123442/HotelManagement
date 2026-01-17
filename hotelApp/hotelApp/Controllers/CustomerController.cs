using hotelApp.DTOs;
using hotelApp.Models;
using hotelApp.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BCrypt.Net;

namespace hotelApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly IUserRepository _userRepo;

        public CustomersController(IUserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        // GET: api/customers
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? keyword)
        {
            // Hardcode lấy role "Customer"
            var users = await _userRepo.GetUsersByRoleAsync("Customer", keyword);

            var dtos = users.Select(u => new CustomerDto
            {
                UserId = u.UserId,
                FullName = u.FullName,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                Role = u.Role,
                CreatedAt = u.CreatedAt
            });

            return Ok(new { items = dtos });
        }

        // GET: api/customers/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var u = await _userRepo.GetByIdAsync(id);
            // Kiểm tra user tồn tại và phải là Customer (tránh việc API này lấy nhầm Admin)
            if (u == null || u.Role != "Customer") return NotFound("Khách hàng không tồn tại");

            return Ok(new CustomerDto
            {
                UserId = u.UserId,
                FullName = u.FullName,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                Role = u.Role,
                CreatedAt = u.CreatedAt
            });
        }

        // POST: api/customers
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CustomerCreateDto dto)
        {
            if (await _userRepo.IsEmailExists(dto.Email))
                return BadRequest("Email này đã được sử dụng.");
            // Mã hóa mật khẩu trước khi lưu xuống DB
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var newUser = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = passwordHash, // Lưu chuỗi đã mã hóa
                PhoneNumber = dto.PhoneNumber,
                Role = "Customer",
                CreatedAt = DateTime.Now
            };

            await _userRepo.AddAsync(newUser);

            return Ok(new { message = "Tạo khách hàng thành công", id = newUser.UserId });
        }

        // PUT: api/customers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CustomerUpdateDto dto)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null || user.Role != "Customer") return NotFound();

            user.FullName = dto.FullName ?? user.FullName;
            user.PhoneNumber = dto.PhoneNumber ?? user.PhoneNumber;

            await _userRepo.UpdateAsync(user);

            return Ok(new { message = "Cập nhật thành công" });
        }

        // DELETE: api/customers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null || user.Role != "Customer") return NotFound();

            await _userRepo.DeleteAsync(id);
            return Ok(new { message = "Xóa khách hàng thành công" });
        }
    }
}