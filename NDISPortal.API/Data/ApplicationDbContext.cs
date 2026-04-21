using Microsoft.EntityFrameworkCore;
using NdisPortal.BookingsApi.Models;
using Register.API.Models;
using Service.API.Model;
using NDIS.API.Model;
namespace NdisPortal.BookingsApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();
        public DbSet<Service.API.Model.Service> Services => Set<Service>();
        public DbSet<Booking> Bookings => Set<Booking>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // --- ServiceItem Relationships ---
            modelBuilder.Entity<Service>(entity =>
            {
                entity.ToTable("services"); // Explicit table name
                entity.HasOne(s => s.ServiceCategory)
                    .WithMany(c => c.Services)
                    .HasForeignKey(s => s.CategoryId) // Corrected to PascalCase
                    .HasConstraintName("FK_Services_ServiceCategories")
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // --- Booking Relationships ---
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.ToTable("bookings");

                entity.HasOne(b => b.User)
                    .WithMany()
                    .HasForeignKey(b => b.UserId)
                    .HasConstraintName("FK_Bookings_Users")
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(b => b.Service)
                    .WithMany()
                    .HasForeignKey(b => b.ServiceId)
                    .HasConstraintName("FK_Bookings_Services")
                    .OnDelete(DeleteBehavior.Restrict);

                // SQL Server specific syntax: use [status] to avoid keyword conflicts
                entity.ToTable(t => t.HasCheckConstraint("CHK_Booking_Status", "[status] IN (0,1,2)"));
            });
        }
    }
}