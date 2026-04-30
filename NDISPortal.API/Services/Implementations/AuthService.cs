using BCrypt.Net;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using Register.API.DTOs.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

namespace Register.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly string _connectionString;
        private readonly IConfiguration _config;

        public AuthService(IConfiguration config)
        {
            _config = config;
            _connectionString = config.GetConnectionString("DefaultConnection");
        }

        public async Task<object> Register(RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FullName) ||
                string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password) ||
                string.IsNullOrWhiteSpace(dto.Role))
            {
                return new { status = 400, message = "All fields are required" };
            }

            var trimmedEmail = dto.Email.Trim();

            // Check email length (max 50 characters)
            if (trimmedEmail.Length > 50)
            {
                return new { status = 400, message = $"Email must be 50 characters or less. Current length: {trimmedEmail.Length}" };
            }

            // Validate email format: must have @ and end with .com
            if (!trimmedEmail.Contains("@"))
            {
                return new { status = 400, message = "Email must contain @ symbol" };
            }
            
            if (!trimmedEmail.EndsWith(".com", StringComparison.OrdinalIgnoreCase))
            {
                return new { status = 400, message = "Email must end with .com" };
            }
            
            // Split email into parts
            var parts = trimmedEmail.Split('@');
            if (parts.Length != 2)
            {
                return new { status = 400, message = "Email must contain exactly one @ symbol" };
            }
            
            var username = parts[0];
            var domain = parts[1];
            
            Console.WriteLine($"Email validation - Username: '{username}', Domain: '{domain}'");
            
            // Check domain is lowercase (before .com)
            var domainWithoutCom = domain.Replace(".com", "");
            if (domainWithoutCom != domainWithoutCom.ToLower())
            {
                return new { status = 400, message = "Domain part of email must be lowercase" };
            }
            
            // Final regex validation
            var emailRegex = new Regex(@"^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.com$");
            if (!emailRegex.IsMatch(trimmedEmail))
            {
                return new { status = 400, message = $"Email format invalid. Email: '{trimmedEmail}'. Must be user@domain.com with lowercase domain" };
            }
            
            Console.WriteLine($"Email validation passed for: '{trimmedEmail}'");

            var allowedRoles = new[] { "Participant", "Coordinator" };

            var matchedRole = allowedRoles
                .FirstOrDefault(r => r.Equals(dto.Role.Trim(), StringComparison.OrdinalIgnoreCase));

            if (matchedRole == null)
            {
                return new
                {
                    status = 400,
                    message = "Role must be either Participant or Coordinator"
                };
            }

            dto.Role = matchedRole;

            if (dto.Password.Length < 8)
            {
                return new { status = 400, message = "Password must be at least 8 characters" };
            }

            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var checkCmd = new SqlCommand(
                "SELECT COUNT(*) FROM users WHERE email = @Email", connection);
            checkCmd.Parameters.AddWithValue("@Email", dto.Email.Trim());

            int exists = (int)await checkCmd.ExecuteScalarAsync();
            if (exists > 0)
            {
                return new { status = 400, message = "Email already exists" };
            }

            var nameParts = dto.FullName.Trim().Split(' ', 2);
            string firstName = nameParts[0];
            string lastName = nameParts.Length > 1 ? nameParts[1] : "";

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var insertCmd = new SqlCommand(@"
                INSERT INTO users (first_name, last_name, email, password_hash, role)
                OUTPUT INSERTED.id
                VALUES (@FirstName, @LastName, @Email, @PasswordHash, @Role)
            ", connection);

            insertCmd.Parameters.AddWithValue("@FirstName", firstName);
            insertCmd.Parameters.AddWithValue("@LastName", lastName);
            insertCmd.Parameters.AddWithValue("@Email", dto.Email.Trim());
            insertCmd.Parameters.AddWithValue("@PasswordHash", hashedPassword);
            insertCmd.Parameters.AddWithValue("@Role", dto.Role);

            int newUserId = (int)await insertCmd.ExecuteScalarAsync();

            return new
            {
                status = 201,
                message = "Account successfully created",
                user = new
                {
                    id = newUserId,
                    role = dto.Role
                }
            };
        }

        public async Task<object> Login(LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password))
            {
                return new { status = 400, message = "Email and Password are required" };
            }

            var trimmedEmail = dto.Email.Trim();

            // Check email length (max 50 characters)
            if (trimmedEmail.Length > 50)
            {
                return new { status = 400, message = $"Email must be 50 characters or less. Current length: {trimmedEmail.Length}" };
            }

            // Validate email format: must have @ and end with .com
            if (!trimmedEmail.Contains("@"))
            {
                return new { status = 400, message = "Email must contain @ symbol" };
            }
            
            if (!trimmedEmail.EndsWith(".com", StringComparison.OrdinalIgnoreCase))
            {
                return new { status = 400, message = "Email must end with .com" };
            }
            
            // Split email into parts
            var parts = trimmedEmail.Split('@');
            if (parts.Length != 2)
            {
                return new { status = 400, message = "Email must contain exactly one @ symbol" };
            }
            
            var username = parts[0];
            var domain = parts[1];
            
            // Check domain is lowercase (before .com)
            var domainWithoutCom = domain.Replace(".com", "");
            if (domainWithoutCom != domainWithoutCom.ToLower())
            {
                return new { status = 400, message = "Domain part of email must be lowercase" };
            }
            
            // Final regex validation
            var emailRegex = new Regex(@"^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.com$");
            if (!emailRegex.IsMatch(trimmedEmail))
            {
                return new { status = 400, message = $"Email format invalid. Email: '{trimmedEmail}'. Must be user@domain.com with lowercase domain" };
            }

            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var cmd = new SqlCommand(@"
                SELECT id, email, password_hash, role
                FROM users
                WHERE email = @Email
            ", connection);

            cmd.Parameters.AddWithValue("@Email", dto.Email.Trim());

            using var reader = await cmd.ExecuteReaderAsync();

            if (!reader.HasRows)
            {
                return new { status = 401, message = "Invalid email or password" };
            }

            await reader.ReadAsync();

            int userId = reader.GetInt32(0);
            string email = reader.GetString(1);
            string passwordHash = reader.GetString(2);
            string role = reader.GetString(3);

            bool isValid = BCrypt.Net.BCrypt.Verify(dto.Password, passwordHash);

            if (!isValid)
            {
                return new { status = 401, message = "Invalid email or password" };
            }

            var claims = new[]
            {
                new Claim("userId", userId.ToString()),
                new Claim("email", email),
                new Claim(ClaimTypes.Role, role)
            };

            var keyString = _config["JwtSettings:Key"];
            var issuer = _config["JwtSettings:Issuer"];
            var audience = _config["JwtSettings:Audience"];
            var expiryHours = _config["JwtSettings:ExpiryHours"];

            if (string.IsNullOrWhiteSpace(keyString) ||
                string.IsNullOrWhiteSpace(issuer) ||
                string.IsNullOrWhiteSpace(audience) ||
                string.IsNullOrWhiteSpace(expiryHours))
            {
                return new { status = 500, message = "JWT settings are missing or invalid" };
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.Now.AddHours(Convert.ToDouble(expiryHours)),
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return new
            {
                status = 200,
                message = "Login successful",
                token = jwt,
                user = new
                {
                    id = userId,
                    role = role
                }
            };
        }
    }
}