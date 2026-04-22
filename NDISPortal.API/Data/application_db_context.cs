using Microsoft.EntityFrameworkCore;
using NdisPortal.BookingsApi.Models;
using Register.API.Models;
using Service.API.Model;
using NDIS.API.Model;
using NDISPortal.API.Models;

namespace NDISPortal.API.Data
{
    public class application_db_context : DbContext
    {
        public application_db_context(DbContextOptions<application_db_context> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<ServiceCategory> service_categories => Set<ServiceCategory>();
        public DbSet<ServiceItem> Services => Set<ServiceItem>();
        public DbSet<Booking> Bookings => Set<Booking>();
        public DbSet<SupportWorker> SupportWorkers => Set<SupportWorker>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // --- Service Category Mapping ---
            modelBuilder.Entity<ServiceCategory>(entity =>
            {
                entity.ToTable("service_categories");
                entity.HasKey(c => c.Id);

                entity.Property(c => c.Id).HasColumnName("id");
                entity.Property(c => c.Name).HasColumnName("name");
                entity.Property(c => c.Description).HasColumnName("description");
            });

            // --- ServiceItem Relationships ---
            modelBuilder.Entity<ServiceItem>(entity =>
            {
                entity.ToTable("services");

                entity.HasOne(s => s.ServiceCategory)
                    .WithMany(c => c.Services)
                    .HasForeignKey(s => s.CategoryId)
                    .HasConstraintName("FK_Services_ServiceCategories")
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // --- SupportWorker Relationships ---
            modelBuilder.Entity<SupportWorker>(entity =>
            {
                entity.ToTable("support_workers");

                entity.HasOne(sw => sw.AssignedService)
                    .WithMany()
                    .HasForeignKey(sw => sw.AssignedServiceId)
                    .HasConstraintName("FK_SupportWorkers_Services")
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

                entity.Property(b => b.Status)
                .HasColumnName("status");

                entity.ToTable(t => t.HasCheckConstraint("CHK_Booking_Status", "[status] IN (0,1,2)"));
            });
        }
    }
}