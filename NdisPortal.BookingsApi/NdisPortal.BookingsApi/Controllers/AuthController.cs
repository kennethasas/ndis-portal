using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        // For testing only – in real app, verify against database
        if (request.Email == "participant1@ndisportal.com" && request.Password == "test")
        {
            var token = GenerateJwtToken(2, "Participant");
            return Ok(new { token });
        }
        if (request.Email == "coordinator@ndisportal.com" && request.Password == "test")
        {
            var token = GenerateJwtToken(1, "Coordinator");
            return Ok(new { token });
        }
        return Unauthorized();
    }

    private string GenerateJwtToken(int userId, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("YourSuperSecretKeyForJwtTokens123!"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, role)
        };
        var token = new JwtSecurityToken(
            issuer: "NdisPortalApi",
            audience: "NdisPortalClient",
            claims: claims,
            expires: DateTime.Now.AddHours(1),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
}