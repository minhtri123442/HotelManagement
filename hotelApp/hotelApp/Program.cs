using Microsoft.EntityFrameworkCore;
using hotelApp.Models;
using AutoMapper;
using hotelApp.Reposities;

var builder = WebApplication.CreateBuilder(args);

// ==================== DB CONTEXT ====================
builder.Services.AddDbContext<HotelContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IHotelReposity, HotelReposity>();


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
app.UseStaticFiles();
app.UseAuthorization();
app.MapControllers();
app.Run();
