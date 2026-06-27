using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantManagement.Api.Data;
using RestaurantManagement.Api.DTOs;
using RestaurantManagement.Api.Helpers;
using RestaurantManagement.Api.Models;

namespace RestaurantManagement.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public UsersController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(ApiResponse<object>.Ok(await _db.Users.OrderBy(x => x.FullName).Select(x => new { x.UserId, x.FullName, x.Email, x.PhoneNumber, x.Role, x.IsActive, x.CreatedAt }).ToListAsync()));

    [HttpPost]
    public async Task<IActionResult> Create(UserRequest request)
    {
        var user = new User { FullName = request.FullName, Email = request.Email.ToLowerInvariant(), PasswordHash = PasswordHasher.Hash(request.Password ?? "Password@123"), PhoneNumber = request.PhoneNumber, Role = request.Role, IsActive = request.IsActive };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<User>.Ok(user, "User created successfully"));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UserRequest request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound(ApiResponse<object>.Fail("User not found"));
        user.FullName = request.FullName;
        user.Email = request.Email.ToLowerInvariant();
        user.PhoneNumber = request.PhoneNumber;
        user.Role = request.Role;
        user.IsActive = request.IsActive;
        if (!string.IsNullOrWhiteSpace(request.Password)) user.PasswordHash = PasswordHasher.Hash(request.Password);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<User>.Ok(user, "User updated successfully"));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound(ApiResponse<object>.Fail("User not found"));
        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(null, "User deleted successfully"));
    }

    [HttpPatch("{id:int}/active")]
    public async Task<IActionResult> SetActive(int id, [FromQuery] bool isActive)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound(ApiResponse<object>.Fail("User not found"));
        user.IsActive = isActive;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<User>.Ok(user, "User status updated successfully"));
    }
}
