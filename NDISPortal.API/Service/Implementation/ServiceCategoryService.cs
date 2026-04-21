using Service.API.Data;
using Service.API.DTOs;
using Microsoft.EntityFrameworkCore;
using Service.API.Service.Interface;

namespace Service.API.Service.Implementation
{
    public class ServiceCategoryService : IServiceCategoryService
    {
      
            private readonly ApplicationDbContext _context;

            public ServiceCategoryService(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<IEnumerable<ServiceCategoryDTO>> GetAllAsync()
            {
                return await _context.ServiceCategories
                    .Select(c => new ServiceCategoryDTO
                    {
                        Id = c.Id,
                        Name = c.name
                    })
                    .ToListAsync();
            }

            public async Task<ServiceCategoryDTO?> GetByIdAsync(int id)
            {
                var category = await _context.ServiceCategories.FindAsync(id);

                if (category == null)
                    return null;

                return new ServiceCategoryDTO
                {
                    Id = category.Id,
                    Name = category.name
                };
            }
        }

}
