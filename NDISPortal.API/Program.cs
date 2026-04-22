using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NdisPortal.BookingsApi.Services.Implementations;
using NdisPortal.BookingsApi.Services.Interfaces;
using NDISPortal.API.Data;
using NDISPortal.API.Services.Implementations;
using NDISPortal.API.Services.Interfaces;
using NDISPortalErrorHandling.Middleware;
using Register.API.Services;
using Service.API.Configurations;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ==================================================
// 1. CONFIGURATION & SETTINGS
// ==================================================
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();

// ==================================================
// 2. DATABASE
// ==================================================
builder.Services.AddDbContext<application_db_context>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ==================================================
// 3. AUTHENTICATION & AUTHORIZATION
// ==================================================
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
        ValidIssuer = jwtSettings?.Issuer,
        ValidAudience = jwtSettings?.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings?.Key ?? "your-ultra-secret-fallback-key-32-chars"))
    };
});

builder.Services.AddAuthorization();

// ==================================================
// 4. DEPENDENCY INJECTION
// ==================================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Auth Service
builder.Services.AddScoped<IAuthService, AuthService>();

// Booking Services
builder.Services.AddScoped<IBookingService, BookingService>();

// Service/Category Services
builder.Services.AddScoped<IServiceCategoryService, ServiceCategoryService>();
builder.Services.AddScoped<IServiceService, ServiceService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Swagger with JWT Security Definitions
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ==================================================
// 5. MIDDLEWARE PIPELINE
// ==================================================
var app = builder.Build();

// Auto-create database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<application_db_context>();
    await context.Database.EnsureCreatedAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<error_handling_middleware>();

app.MapControllers();

app.Run();