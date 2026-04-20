using BCrypt.Net;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using Register.API.DTOs.Auth;
using Register.API.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

public class AuthService : IAuthService
{
    private readonly string _connectionString;
    private readonly IConfiguration _config;

    public AuthService(IConfiguration config)
    {
        _config = config;
        _connectionString = config.GetConnectionString("DefaultConnection");
    }

    // ✅ REGISTER
    public async Task<object> Register(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Password) ||
            string.IsNullOrWhiteSpace(dto.Role))
        {
            return new { status = 400, message = "All fields are required" };
        }

        var emailRegex = new Regex(@"^[^\s@]+@[^\s@]+\.[^\s@]+$");
        if (!emailRegex.IsMatch(dto.Email))
        {
            return new { status = 400, message = "Invalid email format" };
        }

        if (dto.Password.Length < 8)
        {
            return new { status = 400, message = "Password must be at least 8 characters" };
        }

        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        var checkCmd = new SqlCommand(
            "SELECT COUNT(*) FROM users WHERE email = @Email", connection);
        checkCmd.Parameters.AddWithValue("@Email", dto.Email);

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
        insertCmd.Parameters.AddWithValue("@Email", dto.Email);
        insertCmd.Parameters.AddWithValue("@PasswordHash", hashedPassword);
        insertCmd.Parameters.AddWithValue("@Role", dto.Role);

        int newUserId = (int)await insertCmd.ExecuteScalarAsync();

        return new
        {
            status = 201,
            message = "Account successfully created",
            id = newUserId,
            email = dto.Email,
            role = dto.Role
        };
    }

    // ✅ LOGIN
    public async Task<object> Login(LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return new { status = 400, message = "Email and Password are required" };
        }

        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        var cmd = new SqlCommand(@"
            SELECT id, email, password_hash, role
            FROM users
            WHERE email = @Email
        ", connection);

        cmd.Parameters.AddWithValue("@Email", dto.Email);

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

        // JWT
        var claims = new[]
        {
            new Claim("userId", userId.ToString()),
            new Claim("email", email),
            new Claim("role", role)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(
                Convert.ToDouble(_config["Jwt:ExpiryHours"])),
            signingCredentials: creds
        );

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);

        return new
        {
            status = 200,
            message = "Login successful",
            token = jwt,
            userId = userId,
            email = email,
            role = role
        };
    }
}