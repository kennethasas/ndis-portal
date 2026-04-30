using Microsoft.EntityFrameworkCore;

using NDIS.API.Model;

using NdisPortal.BookingsApi.Models;

using NDISPortal.API.Models;

using Register.API.Models;

using Service.API.Model;



namespace NDISPortal.API.Data

{

    public class application_db_context : DbContext

    {

        public application_db_context(DbContextOptions<application_db_context> options) : base(options) { }



        public DbSet<User> Users => Set<User>();

        public DbSet<ServiceCategory> service_categories => Set<ServiceCategory>();

        public DbSet<ServiceItem> Services => Set<ServiceItem>();

        public DbSet<Booking> Bookings => Set<Booking>();

        

        public DbSet<SupportWorkers> SupportWorker => Set<SupportWorkers>();

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

                // Ignore Description property since database doesn't have this column

                entity.Ignore(c => c.Description);

            });



            // --- ServiceItem Mapping ---

            modelBuilder.Entity<ServiceItem>(entity =>

            {

                entity.ToTable("services");



                entity.HasKey(s => s.Id);



                entity.Property(s => s.Id).HasColumnName("id");

                entity.Property(s => s.CategoryId).HasColumnName("category_id");

                entity.Property(s => s.Name).HasColumnName("name");

                entity.Property(s => s.Description).HasColumnName("description");

                entity.Property(s => s.is_active).HasColumnName("is_active");

                entity.Property(s => s.created_date).HasColumnName("created_date");

                entity.Property(s => s.modified_date).HasColumnName("modified_date");



                entity.HasOne(s => s.ServiceCategory)

                    .WithMany(c => c.Services)

                    .HasForeignKey(s => s.CategoryId)

                    .HasConstraintName("FK_Services_ServiceCategories")

                    .OnDelete(DeleteBehavior.Restrict);

            });



            // --- Booking Mapping ---

            modelBuilder.Entity<Booking>(entity =>

            {

                entity.ToTable("bookings");



                entity.HasKey(b => b.Id);



                entity.Property(b => b.Id).HasColumnName("id");

                entity.Property(b => b.UserId).HasColumnName("user_id");

                entity.Property(b => b.ServiceId).HasColumnName("service_id");

                entity.Property(b => b.BookingDate).HasColumnName("booking_date");

                entity.Property(b => b.Notes).HasColumnName("notes");

                entity.Property(b => b.Status).HasColumnName("status");

                entity.Property(b => b.CreatedDate).HasColumnName("created_date");

                entity.Property(b => b.ModifiedDate).HasColumnName("modified_date");



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



                entity.ToTable(t => t.HasCheckConstraint("CHK_Booking_Status", "[status] IN (0,1,2)"));

            });

        }

    }

}