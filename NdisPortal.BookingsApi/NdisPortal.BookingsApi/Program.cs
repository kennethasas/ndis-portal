using Microsoft.EntityFrameworkCore;
using NdisPortal.BookingsApi.Data;
using NdisPortal.BookingsApi.Middleware;
using NdisPortal.BookingsApi.Services.Implementations;
using NdisPortal.BookingsApi.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database connection
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register services
builder.Services.AddScoped<IBookingService, BookingService>();

var app = builder.Build();

// =============================================
// FIX IDENTITY CACHE GAPS ON STARTUP
// =============================================
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // List of tables to reset
    var tables = new[] { "users", "service_categories", "services", "bookings" };

    foreach (var table in tables)
    {
        try
        {
            // This resets identity to 0, next insert gets ID = 1
            await context.Database.ExecuteSqlRawAsync($"DBCC CHECKIDENT ('{table}', RESEED, 0);");
            Console.WriteLine($"? Reset {table} identity to 0");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"? Could not reset {table}: {ex.Message}");
        }
    }
}
// =============================================

// Register middleware
app.UseMiddleware<ResponseWrappingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();