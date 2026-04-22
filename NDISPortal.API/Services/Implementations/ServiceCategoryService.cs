using NDISPortal.API.Data;
using Service.API.DTOs;
using Microsoft.EntityFrameworkCore;
using NDISPortal.API.Services.Interfaces;

namespace NDISPortal.API.Services.Implementations
{
    public class ServiceCategoryService : IServiceCategoryService
    {
        private readonly application_db_context _context;

        public ServiceCategoryService(application_db_context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ServiceCategoryDto>> GetAllAsync()
        {
            return await _context.service_categories
                .Select(c => new ServiceCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name
                })
                .ToListAsync();
        }

        public async Task<ServiceCategoryDto?> GetByIdAsync(int id)
        {
            return await _context.service_categories
                .Where(c => c.Id == id)
                .Select(c => new ServiceCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name
                })
                .FirstOrDefaultAsync();
        }
    }
}