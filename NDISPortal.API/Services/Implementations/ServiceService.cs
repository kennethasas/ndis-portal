using Microsoft.EntityFrameworkCore;
using NDISPortal.API.Data;
using NDISPortal.API.Services.Interfaces;
using Service.API.DTOs.Service;
using Service.API.Model;

namespace NDISPortal.API.Services.Implementations
{
    public class ServiceService : IServiceService
    {
        private readonly application_db_context _context;

        public ServiceService(application_db_context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ServiceDto>> GetAllAsync(int? categoryId)
        {
            var query = _context.Services
                .Include(s => s.ServiceCategory)
                .Where(s => s.is_active) // Only active services for participants
                .AsQueryable();

            if (categoryId.HasValue)
            {
                query = query.Where(s => s.CategoryId == categoryId.Value);
            }

            var services = await query
                .Select(s => new ServiceDto
                {
                    Id = s.Id,
                    CategoryId = s.CategoryId,
                    CategoryName = s.ServiceCategory != null ? s.ServiceCategory.Name : string.Empty,
                    Name = s.Name,
                    Description = s.Description,
                    IsActive = s.is_active
                })
                .ToListAsync();

            return services;
        }

        public async Task<IEnumerable<ServiceDto>> GetAllForCoordinatorAsync(int? categoryId)
        {
            try
            {
                Console.WriteLine("GetAllForCoordinatorAsync: Starting database query...");
                
                // Check if we can access the database at all
                var serviceCount = await _context.Services.CountAsync();
                Console.WriteLine($"Total services in database: {serviceCount}");
                
                var categoryCount = await _context.service_categories.CountAsync();
                Console.WriteLine($"Total categories in database: {categoryCount}");
                
                // Use real database query
                var query = _context.Services
                    .Include(s => s.ServiceCategory)
                    .AsQueryable(); // All services (active and inactive) for coordinators

                if (categoryId.HasValue)
                {
                    query = query.Where(s => s.CategoryId == categoryId.Value);
                    Console.WriteLine($"Filtering by category ID: {categoryId.Value}");
                }

                // Log the SQL query
                var sql = query.ToQueryString();
                Console.WriteLine($"SQL Query: {sql}");

                var services = await query
                    .Select(s => new ServiceDto
                    {
                        Id = s.Id,
                        CategoryId = s.CategoryId,
                        CategoryName = s.ServiceCategory != null ? s.ServiceCategory.Name : string.Empty,
                        Name = s.Name,
                        Description = s.Description,
                        IsActive = s.is_active
                    })
                    .ToListAsync();

                Console.WriteLine($"Found {services.Count} services");
                foreach (var service in services.Take(3))
                {
                    Console.WriteLine($"Service: ID={service.Id}, Name={service.Name}, Active={service.IsActive}");
                }

                return services;
            }
            catch (Exception ex)
            {
                // Log the error for debugging
                Console.WriteLine($"Error in GetAllForCoordinatorAsync: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                // Return empty list instead of throwing to avoid breaking the frontend
                return new List<ServiceDto>();
            }
        }

        public async Task<ServiceDto?> GetByIdAsync(int id)
        {
            var service = await _context.Services
                .Include(s => s.ServiceCategory)
                .Where(s => s.Id == id && s.is_active)
                .Select(s => new ServiceDto
                {
                    Id = s.Id,
                    CategoryId = s.CategoryId,
                    CategoryName = s.ServiceCategory != null ? s.ServiceCategory.Name : string.Empty,
                    Name = s.Name,
                    Description = s.Description,
                    IsActive = s.is_active
                })
                .FirstOrDefaultAsync();

            return service;
        }

        public async Task<ServiceDto> CreateAsync(CreateServiceDto dto)
        {
            if (dto.CategoryId <= 0)
            {
                throw new ArgumentException("Category ID is required.");
            }

            var categoryExists = await _context.service_categories
                .AnyAsync(c => c.Id == dto.CategoryId);

            if (!categoryExists)
            {
                throw new ArgumentException("Category ID must have an existing category ID.");
            }

            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ArgumentException("Service name is required.");
            }

            var service = new ServiceItem
            {
                CategoryId = dto.CategoryId,
                Name = dto.Name.Trim(),
                Description = dto.Description,
                is_active = true,
                created_date = DateTime.UtcNow,
                modified_date = DateTime.UtcNow
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            var created = await _context.Services
                .Include(s => s.ServiceCategory)
                .Where(s => s.Id == service.Id)
                .Select(s => new ServiceDto
                {
                    Id = s.Id,
                    CategoryId = s.CategoryId,
                    CategoryName = s.ServiceCategory != null ? s.ServiceCategory.Name : string.Empty,
                    Name = s.Name,
                    Description = s.Description,
                    IsActive = s.is_active
                })
                .FirstAsync();

            return created;
        }

        public async Task<ServiceDto?> UpdateAsync(int id, UpdateServiceDto dto)
        {
            var service = await _context.Services
                .FirstOrDefaultAsync(s => s.Id == id);

            if (service == null)
            {
                return null;
            }

            if (dto.CategoryId <= 0)
            {
                throw new ArgumentException("Category ID is required.");
            }

            var categoryExists = await _context.service_categories
                .AnyAsync(c => c.Id == dto.CategoryId);

            if (!categoryExists)
            {
                throw new ArgumentException("Category ID must have an existing category ID.");
            }

            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ArgumentException("Service name is required.");
            }

            service.CategoryId = dto.CategoryId;
            service.Name = dto.Name.Trim();
            service.Description = dto.Description;
            service.is_active = dto.IsActive;
            service.modified_date = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var updated = await _context.Services
                .Include(s => s.ServiceCategory)
                .Where(s => s.Id == service.Id)
                .Select(s => new ServiceDto
                {
                    Id = s.Id,
                    CategoryId = s.CategoryId,
                    CategoryName = s.ServiceCategory != null ? s.ServiceCategory.Name : string.Empty,
                    Name = s.Name,
                    Description = s.Description,
                    IsActive = s.is_active
                })
                .FirstOrDefaultAsync();

            return updated;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var service = await _context.Services
                .FirstOrDefaultAsync(s => s.Id == id);

            if (service == null)
            {
                return false;
            }

            service.is_active = false;
            service.modified_date = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}