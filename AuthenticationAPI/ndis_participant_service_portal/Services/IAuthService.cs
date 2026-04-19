using Register.API.DTOs.Auth;

namespace Register.API.Services
{
    public interface IAuthService
    {
        Task<object> Register(RegisterDto dto);
        Task<dynamic> Login(LoginDto dto);
    }
}
