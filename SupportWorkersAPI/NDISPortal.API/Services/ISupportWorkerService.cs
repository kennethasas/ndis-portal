using NDISPortal.API.DTOs;

namespace NDISPortal.API.Services
{
    public interface ISupportWorkerService
    {
        Task<List<SupportWorkerResponseDto>> GetAllAsync();
        Task<SupportWorkerResponseDto> CreateAsync(CreateSupportWorkerDto dto);
    }
}