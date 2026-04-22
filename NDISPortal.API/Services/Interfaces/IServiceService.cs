using Service.API.DTOs.Service;

namespace NDISPortal.API.Services.Interfaces
{
    public interface IServiceService
    {
        Task<IEnumerable<ServiceDto>> GetAllAsync(int? categoryId);

        Task<ServiceDto?> GetByIdAsync(int id);

        Task<ServiceDto> CreateAsync(CreateServiceDto dto);

        Task<ServiceDto?> UpdateAsync(int id, UpdateServiceDto dto);

        Task<bool> DeleteAsync(int id);
    }
}