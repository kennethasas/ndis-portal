using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Register.API.DTOs.Auth;
using Register.API.Services;

namespace Register.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _service;

        public AuthController(IAuthService service)
        {
            _service = service;
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegistserDto dto)
        {
            var result = await _service.Register(dto);
            dynamic res = result;
            return StatusCode(res.status, res);
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var result = await _service.Login(dto);
            dynamic res = result;
            return StatusCode(res.status, res);
        }
    }
}