using Microsoft.EntityFrameworkCore;
using NDISPortal.API.Data;
using NDISPortal.API.Services;

var builder = WebApplication.CreateBuilder(args);

// DB CONNECTION
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// SERVICES
builder.Services.AddScoped<ISupportWorkerService, SupportWorkerService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();