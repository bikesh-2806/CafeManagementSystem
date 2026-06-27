using RestaurantManagement.Api.DTOs;

namespace RestaurantManagement.Api.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse?> LoginAsync(LoginRequest request);
}
