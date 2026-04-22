using Register.API.DTOs.Auth;

namespace Register.API.Services
{
    public interface IAuthService
    {
        Task<object> Register(RegistserDto dto);
        Task<object> Login(LoginDto dto);
    }
}