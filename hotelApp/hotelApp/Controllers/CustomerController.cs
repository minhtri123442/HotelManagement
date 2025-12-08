using Microsoft.AspNetCore.Mvc;
using hotelApp.Models;
using Microsoft.EntityFrameworkCore;
namespace hotelApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly HotelContext _context;

        public CustomerController(HotelContext context)
        {
            _context = context;
        }

        // GET: api/Customer
        [HttpGet]
        public async Task<IActionResult> GetCustomers()
        {
            var customers = await _context.Customers.ToListAsync();
            return Ok(customers);
        }
    }
}
