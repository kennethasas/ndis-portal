using Register.API.DTO;

namespace Register.API.Services.NDISPortal.API.Services
{
    public interface IChatService
    {
        Task<string> SendMessage(ChatRequestDto dto);
    }
}