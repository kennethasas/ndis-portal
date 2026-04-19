using Microsoft.EntityFrameworkCore;
using NdisPortal.BookingsApi.Models;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace NdisPortal.BookingsApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Booking -> User
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.User)
            .WithMany()
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Booking -> Service
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Service)
            .WithMany()
            .HasForeignKey(b => b.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);

        // Status constraint (mirrors SQL CHECK)
        modelBuilder.Entity<Booking>()
            .HasCheckConstraint("CHK_booking_status", "status IN (0,1,2)");
    }
}