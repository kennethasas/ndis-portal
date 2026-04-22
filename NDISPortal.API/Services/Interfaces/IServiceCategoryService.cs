    using Service.API.DTOs;

    namespace NDISPortal.API.Services.Interfaces
    {
        public interface IServiceCategoryService
        {
            Task<IEnumerable<ServiceCategoryDto>> GetAllAsync();
            Task<ServiceCategoryDto?> GetByIdAsync(int id);
        }
    }
