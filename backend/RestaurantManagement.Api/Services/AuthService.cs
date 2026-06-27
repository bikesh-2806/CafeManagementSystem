using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using RestaurantManagement.Api.Data;
using RestaurantManagement.Api.DTOs;
using RestaurantManagement.Api.Helpers;
using RestaurantManagement.Api.Interfaces;
using RestaurantManagement.Api.Models;

namespace RestaurantManagement.Api.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _db;
    private readonly JwtSettings _jwt;

    public AuthService(ApplicationDbContext db, IOptions<JwtSettings> jwt)
    {
        _db = db;
        _jwt = jwt.Value;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _db.Users.AnyAsync(x => x.Email == request.Email))
            throw new InvalidOperationException("Email is already registered.");

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email.ToLowerInvariant(),
            PasswordHash = PasswordHasher.Hash(request.Password),
            PhoneNumber = request.PhoneNumber,
            Role = request.Role,
            IsActive = true
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return ToAuthResponse(user);
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(x => x.Email == request.Email.ToLowerInvariant() && x.IsActive);
        if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash)) return null;
        return ToAuthResponse(user);
    }

    private AuthResponse ToAuthResponse(User user) => new(user.UserId, user.FullName, user.Email, user.Role, CreateToken(user));

    private string CreateToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
        var token = new JwtSecurityToken(_jwt.Issuer, _jwt.Audience, claims, expires: DateTime.UtcNow.AddMinutes(_jwt.ExpiresInMinutes), signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
