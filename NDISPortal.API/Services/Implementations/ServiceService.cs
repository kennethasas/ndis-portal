using Microsoft.EntityFrameworkCore;
using NDISPortal.API.Services.Interfaces;
using Service.API.DTOs;
using Service.API.Model;
using NdisPortal.BookingsApi.Data;

namespace NDISPortal.API.Services.Implementations
{
    public class ServiceService : IServiceService
    {
        private readonly ApplicationDbContext _context;

        public ServiceService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ServicesDTO>> GetAllAsync(int? categoryId)
        {
            var query = _context.Services
                .Include(s => s.ServiceCategory)
                .Where(s => s.is_active);

            if (categoryId.HasValue)
            {
                query = query.Where(s => s.CategoryId == categoryId.Value);
            }

            return await query
                .Select(s => new ServicesDTO
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    CategoryId = s.CategoryId,
                    CategoryName = s.ServiceCategory != null ? s.ServiceCategory.name : null,
                    is_active = s.is_active
                })
                .ToListAsync();
        }

        public async Task<ServicesDTO?> GetByIdAsync(int id)
        {
            return await _context.Services
                .Include(s => s.ServiceCategory)
                .Where(s => s.Id == id && s.is_active)
                .Select(s => new ServicesDTO
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    CategoryId = s.CategoryId,
                    CategoryName = s.ServiceCategory != null ? s.ServiceCategory.name : null,
                    is_active = s.is_active
                })
                .FirstOrDefaultAsync();
        }

        public async Task<ServicesDTO> CreateAsync(ServicesDTO dto)
        {
            var categoryExists = await _context.ServiceCategories
                .AnyAsync(c => c.Id == dto.CategoryId);

            if (!categoryExists)
                throw new Exception("Invalid CategoryId");

            var service = new Service.API.Model.Service
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

            dto.Id = service.Id;
            dto.is_active = true;

            return dto;
        }

        public async Task<ServicesDTO?> UpdateAsync(int id, ServicesDTO dto)
        {
            var service = await _context.Services
                .FirstOrDefaultAsync(s => s.Id == id && s.is_active);

            if (service == null)
                return null;

            var categoryExists = await _context.ServiceCategories
                .AnyAsync(c => c.Id == dto.CategoryId);

            if (!categoryExists)
                return null;

            service.Name = dto.Name;
            service.Description = dto.Description;
            service.CategoryId = dto.CategoryId;
            service.is_active = dto.is_active;
            service.modified_date = DateTime.Now;

            await _context.SaveChangesAsync();

            return dto;
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