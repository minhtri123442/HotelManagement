using Microsoft.EntityFrameworkCore;
using hotelApp.Models;
using AutoMapper;
using hotelApp.Repositories;
using hotelApp.DTOs;
using hotelApp.Controllers;
using hotelApp.Helpers;
using hotelApp.Services;
using hotelApp.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ==================== DB CONTEXT ====================
builder.Services.AddDbContext<HotelContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IHotelRepository, HotelRepository>();
builder.Services.AddScoped<IRoomTypeRepository, RoomTypeRepository>();
builder.Services.AddScoped<IRoomTypeService, RoomTypeService>();
builder.Services.AddScoped<IRoomAvailabilityRepository, RoomAvailabilityRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

builder.Services.AddScoped<IAvailabilityService, AvailabilityService>();
// 1. Đọc config từ appsettings
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));

// 2. Đăng ký Service
builder.Services.AddScoped<IPhotoService, PhotoService>();


// 1. Map section "EmailSettings" trong appsettings vào class
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

// 2. Đăng ký EmailService (Transient: tạo mới mỗi lần dùng)
builder.Services.AddTransient<IEmailService, EmailService>();


// ==================== AUTO MAPPER ====================
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// ==================== CORS ====================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddControllers().AddJsonOptions(x =>
{
    // Bỏ qua các vòng lặp quan hệ khi trả về JSON
    x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});



// ==================== BUILD APP ====================
// ==================== BUILD APP ====================
var app = builder.Build();

// ============== CHẠY DATA MẪU (DỌN DẸP LẠI CHỈ CÒN 1 KHỐI) ==============
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<HotelContext>();
        // Gọi hàm Initialize (nó sẽ gọi tiếp SeedUsers, SeedLocations, SeedAmenities)
        DbInitializer.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred creating the DB.");
    }
}

// ==================== MIDDLEWARE PIPELINE ====================

// 1. Swagger luôn để đầu nếu là Dev
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

// 2. CORS phải đứng TRƯỚC Authentication/Authorization
app.UseCors("AllowReact");

// 3. THỨ TỰ BẮT BUỘC: Authen rồi mới đến Author
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
