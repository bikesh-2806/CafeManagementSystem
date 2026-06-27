using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantManagement.Api.Data;
using RestaurantManagement.Api.DTOs;
using RestaurantManagement.Api.Models;

namespace RestaurantManagement.Api.Controllers;

[ApiController]
[Route("api/menu-items")]
public class MenuItemsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IWebHostEnvironment _environment;
    public MenuItemsController(ApplicationDbContext db, IWebHostEnvironment environment)
    {
        _db = db;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? categoryId, [FromQuery] string? search)
    {
        var query = _db.MenuItems.Include(x => x.Category).AsQueryable();
        if (categoryId.HasValue) query = query.Where(x => x.CategoryId == categoryId);
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(x => x.Name.Contains(search) || x.Description.Contains(search));
        return Ok(ApiResponse<object>.Ok(await query.OrderBy(x => x.Name).ToListAsync()));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(MenuItemRequest request)
    {
        var item = new MenuItem { Name = request.Name, Description = request.Description, Price = request.Price, ImageUrl = request.ImageUrl, CategoryId = request.CategoryId, IsAvailable = request.IsAvailable };
        _db.MenuItems.Add(item);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<MenuItem>.Ok(item, "Menu item created successfully"));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, MenuItemRequest request)
    {
        var item = await _db.MenuItems.FindAsync(id);
        if (item is null) return NotFound(ApiResponse<object>.Fail("Menu item not found"));
        item.Name = request.Name;
        item.Description = request.Description;
        item.Price = request.Price;
        item.ImageUrl = request.ImageUrl;
        item.CategoryId = request.CategoryId;
        item.IsAvailable = request.IsAvailable;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<MenuItem>.Ok(item, "Menu item updated successfully"));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.MenuItems.FindAsync(id);
        if (item is null) return NotFound(ApiResponse<object>.Fail("Menu item not found"));
        _db.MenuItems.Remove(item);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(null, "Menu item deleted successfully"));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage(IFormFile image)
    {
        if (image.Length == 0) return BadRequest(ApiResponse<object>.Fail("Please select an image."));
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension)) return BadRequest(ApiResponse<object>.Fail("Only JPG, PNG, and WEBP images are allowed."));

        var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
        var uploadFolder = Path.Combine(webRoot, "uploads", "menu");
        Directory.CreateDirectory(uploadFolder);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(uploadFolder, fileName);
        await using var stream = System.IO.File.Create(filePath);
        await image.CopyToAsync(stream);

        var relativeUrl = $"/uploads/menu/{fileName}";
        return Ok(ApiResponse<object>.Ok(new { imageUrl = relativeUrl }, "Image uploaded successfully"));
    }
}
