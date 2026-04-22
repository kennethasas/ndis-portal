using Service.API.DTOs;

namespace NDISPortal.API.Services.Interfaces
{
    public interface IServiceService
    {
        Task<IEnumerable<ServicesDto>> GetAllAsync(int? categoryId);
        Task<ServicesDto?> GetByIdAsync(int id);
        Task<ServicesDto> CreateAsync(ServicesDto dto);
        Task<ServicesDto?> UpdateAsync(int id, ServicesDto dto);
        Task<bool> DeleteAsync(int id);
    }
}