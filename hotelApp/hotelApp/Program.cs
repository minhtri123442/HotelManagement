using Microsoft.EntityFrameworkCore;
using hotelApp.Models;
using AutoMapper;

var builder = WebApplication.CreateBuilder(args);

// ==================== DB CONTEXT ====================
builder.Services.AddDbContext<HotelContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ==================== AUTO MAPPER ====================
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// ==================== CORS ====================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy =>
        {
            policy.WithOrigins("http://localhost:5174")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ==================== BUILD APP ====================
var app = builder.Build();

// CORS phải đặt trước MapControllers
app.UseCors("AllowReact");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
