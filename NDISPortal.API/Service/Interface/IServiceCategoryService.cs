using Service.API.DTOs;

namespace Service.API.Service.Interface
{
    public interface IServiceCategoryService
    {
        Task<IEnumerable<ServiceCategoryDTO>> GetAllAsync();
        Task<ServiceCategoryDTO?> GetByIdAsync(int id);
    }
}
