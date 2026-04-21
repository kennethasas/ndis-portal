using Service.API.DTOs;

namespace Service.API.Service.Interface
{
    public interface IServiceService
    {
        Task<IEnumerable<ServicesDTO>> GetAllAsync(int? categoryId);
        Task<ServicesDTO?> GetByIdAsync(int id);
        Task<ServicesDTO> CreateAsync(ServicesDTO dto);
        Task<ServicesDTO?> UpdateAsync(int id, ServicesDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}