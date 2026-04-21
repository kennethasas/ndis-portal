using Microsoft.EntityFrameworkCore;
using Service.API.Model;


namespace Service.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<ServiceItem> Services { get; set; }
        public DbSet<ServiceCategory> ServiceCategories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ServiceItem>().ToTable("services");
            modelBuilder.Entity<ServiceCategory>().ToTable("service_categories");


            modelBuilder.Entity<ServiceItem>()
                .HasOne(s => s.ServiceCategory)
                .WithMany(c => c.Services)
                .HasForeignKey(s => s.category_id)
                .HasConstraintName("FK_services_category");
        }
    }
}