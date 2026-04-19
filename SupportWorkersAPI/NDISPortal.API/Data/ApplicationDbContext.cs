using Microsoft.EntityFrameworkCore;
using NDISPortal.API.Models;

namespace NDISPortal.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // TABLES
        public DbSet<SupportWorker> SupportWorkers { get; set; }
        public DbSet<Service> Services { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // SUPPORT WORKER CONFIG
            modelBuilder.Entity<SupportWorker>(entity =>
            {
                entity.ToTable("support_workers");

                entity.HasKey(e => e.Id);

                entity.Property(e => e.FirstName)
                      .HasColumnName("first_name")
                      .HasMaxLength(50)
                      .IsRequired();

                entity.Property(e => e.LastName)
                      .HasColumnName("last_name")
                      .HasMaxLength(50)
                      .IsRequired();

                entity.Property(e => e.Email)
                      .HasColumnName("email")
                      .HasMaxLength(150)
                      .IsRequired();

                entity.Property(e => e.Phone)
                      .HasColumnName("phone")
                      .HasMaxLength(20);

                entity.Property(e => e.ServiceId)
                      .HasColumnName("service_id")
                      .IsRequired();

                entity.Property(e => e.CreatedDate)
                      .HasColumnName("created_date")
                      .HasDefaultValueSql("GETDATE()");

                entity.Property(e => e.ModifiedDate)
                      .HasColumnName("modified_date")
                      .HasDefaultValueSql("GETDATE()");

                // RELATIONSHIP
                entity.HasOne(e => e.Service)
                      .WithMany()
                      .HasForeignKey(e => e.ServiceId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // SERVICE CONFIG
            modelBuilder.Entity<Service>(entity =>
            {
                entity.ToTable("services");

                entity.HasKey(e => e.Id);

                entity.Property(e => e.CategoryId)
                      .HasColumnName("category_id");

                entity.Property(e => e.Name)
                      .HasColumnName("name")
                      .HasMaxLength(50)
                      .IsRequired();

                entity.Property(e => e.Description)
                      .HasColumnName("description")
                      .HasMaxLength(200)
                      .IsRequired();

                entity.Property(e => e.IsActive)
                      .HasColumnName("is_active");

                entity.Property(e => e.CreatedDate)
                      .HasColumnName("created_date")
                      .HasDefaultValueSql("GETDATE()");

                entity.Property(e => e.ModifiedDate)
                      .HasColumnName("modified_date")
                      .HasDefaultValueSql("GETDATE()");
            });
        }
    }
}