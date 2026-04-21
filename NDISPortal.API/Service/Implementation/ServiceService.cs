using Microsoft.EntityFrameworkCore;
using Service.API.Data;
using Service.API.DTOs;
using Service.API.Model;
using Service.API.Service.Interface;

namespace Service.API.Service.Implementation
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
                query = query.Where(s => s.category_id == categoryId.Value);
            }

            return await query
                .Select(s => new ServicesDTO
                {
                    Id = s.Id,
                    Name = s.name,
                    Description = s.description,
                    CategoryId = s.category_id,
                    CategoryName = s.ServiceCategory != null ? s.ServiceCategory.name : null,
                    IsActive = s.is_active
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
                    Name = s.name,
                    Description = s.description,
                    CategoryId = s.category_id,
                    CategoryName = s.ServiceCategory != null ? s.ServiceCategory.name : null,
                    IsActive = s.is_active
                })
                .FirstOrDefaultAsync();
        }

        public async Task<ServicesDTO> CreateAsync(ServicesDTO dto)
        {
            var categoryExists = await _context.ServiceCategories
                .AnyAsync(c => c.Id == dto.CategoryId);

            if (!categoryExists)
                throw new Exception("Invalid CategoryId");

            var serviceItem = new ServiceItem
            {
                name = dto.Name,
                description = dto.Description,
                category_id = dto.CategoryId,
                is_active = true,
                created_date = DateTime.Now,
                modified_date = DateTime.Now
            };

            _context.Services.Add(serviceItem);
            await _context.SaveChangesAsync();

            dto.Id = serviceItem.Id;
            dto.IsActive = true;

            return dto;
        }

        public async Task<ServicesDTO?> UpdateAsync(int id, ServicesDTO dto)
        {
            var serviceItem = await _context.Services
                .FirstOrDefaultAsync(s => s.Id == id && s.is_active);

            if (serviceItem == null)
                return null;

            var categoryExists = await _context.ServiceCategories
                .AnyAsync(c => c.Id == dto.CategoryId);

            if (!categoryExists)
                return null;

            serviceItem.name = dto.Name;
            serviceItem.description = dto.Description;
            serviceItem.category_id = dto.CategoryId;
            serviceItem.is_active = dto.IsActive;
            serviceItem.modified_date = DateTime.Now;

            await _context.SaveChangesAsync();

            return dto;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var serviceItem = await _context.Services.FindAsync(id);

            if (serviceItem == null)
                return false;

            serviceItem.is_active = false;
            serviceItem.modified_date = DateTime.Now;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}