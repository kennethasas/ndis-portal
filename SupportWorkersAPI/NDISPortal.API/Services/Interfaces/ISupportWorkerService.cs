using NDISPortal.API.DTOs;

namespace SupportWorkersAPI.Services.Interfaces
{
    public interface ISupportWorkerService
    {
        Task<List<SupportWorkerResponseDto>> GetAllAsync();
        Task<SupportWorkerResponseDto> CreateAsync(CreateSupportWorkerDto dto);
        Task<SupportWorkerResponseDto?> GetByIdAsync(int id);  // NEW
        Task<SupportWorkerResponseDto?> UpdateAsync(int id, UpdateSupportWorkerDto dto);  // NEW
        Task<bool> DeleteAsync(int id);  // NEW
    }
}