using Microsoft.EntityFrameworkCore;
using NDISPortal.API.Services.Interfaces;
using NDISPortal.API.Data;
using Service.API.DTOs.Service;


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
                .Where(s => s.is_active);

            if (categoryId.HasValue)
            {
                query = query.Where(s => s.CategoryId == categoryId.Value);
            }

            return await query
                .Select(s => new ServiceDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    CategoryId = s.CategoryId,
                    CategoryName = s.ServiceCategory != null ? s.ServiceCategory.Name : null,
                    is_active = s.is_active
                })
                .ToListAsync();
        }

        public async Task<ServiceDto?> GetByIdAsync(int id)
        {
            return await _context.Services
                .Include(s => s.ServiceCategory)
                .Where(s => s.Id == id && s.is_active)
                .Select(s => new ServiceDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    CategoryId = s.CategoryId,
                    CategoryName = s.ServiceCategory != null ? s.ServiceCategory.Name : null,
                    is_active = s.is_active
                })
                .FirstOrDefaultAsync();
        }

        public async Task<ServiceDto> CreateAsync(CreateServiceDto dto)
        {
            var categoryExists = await _context.service_categories
                .AnyAsync(c => c.Id == dto.CategoryId);

            if (!categoryExists)
                throw new Exception("Invalid CategoryId");

            var service = new Service.API.Model.ServiceItem
            {
                Name = dto.Name,
                Description = dto.Description,
                CategoryId = dto.CategoryId,
                is_active = true,
                created_date = DateTime.Now,
                modified_date = DateTime.Now
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return new ServiceDto
            {
                Id = service.Id,
                Name = service.Name,
                Description = service.Description,
                CategoryId = service.CategoryId,
                CategoryName = service.ServiceCategory?.Name,
                is_active = service.is_active
            };
        }

        public async Task<ServiceDto?> UpdateAsync(int id, UpdateServiceDto dto)
        {
            var service = await _context.Services
                .FirstOrDefaultAsync(s => s.Id == id && s.is_active);

            if (service == null)
                return null;

            var categoryExists = await _context.service_categories
                .AnyAsync(c => c.Id == dto.CategoryId);

            if (!categoryExists)
                return null;

            service.Name = dto.Name;
            service.Description = dto.Description;
            service.CategoryId = dto.CategoryId;
            service.is_active = dto.is_active;
            service.modified_date = DateTime.Now;

            await _context.SaveChangesAsync();

            return new ServiceDto
            {
                Id = service.Id,
                Name = service.Name,
                Description = service.Description,
                CategoryId = service.CategoryId,
                CategoryName = service.ServiceCategory?.Name,
                is_active = service.is_active
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var service = await _context.Services.FindAsync(id);

            if (service == null)
                return false;

            service.is_active = false;
            service.modified_date = DateTime.Now;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}