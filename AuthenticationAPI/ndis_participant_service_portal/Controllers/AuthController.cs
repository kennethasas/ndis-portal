using Microsoft.AspNetCore.Mvc;
using Register.API.DTOs.Auth;
using Register.API.Services;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var result = await _authService.Register(dto);

        dynamic res = result;

        return StatusCode(res.status, res);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await _authService.Login(dto);

        dynamic res = result;

        return StatusCode(res.status, res);
    }
}