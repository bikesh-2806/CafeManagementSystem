using Microsoft.AspNetCore.Mvc;
using RestaurantManagement.Api.DTOs;
using RestaurantManagement.Api.Interfaces;

namespace RestaurantManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Register(RegisterRequest request)
        => Ok(ApiResponse<AuthResponse>.Ok(await _auth.RegisterAsync(request), "Registration completed successfully"));

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login(LoginRequest request)
    {
        var result = await _auth.LoginAsync(request);
        return result is null ? Unauthorized(ApiResponse<AuthResponse>.Fail("Invalid email or password")) : Ok(ApiResponse<AuthResponse>.Ok(result, "Login successful"));
    }
}
