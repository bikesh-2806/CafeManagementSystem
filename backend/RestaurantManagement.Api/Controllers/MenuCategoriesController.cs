using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantManagement.Api.Data;
using RestaurantManagement.Api.DTOs;
using RestaurantManagement.Api.Models;

namespace RestaurantManagement.Api.Controllers;

[ApiController]
[Route("api/menu-categories")]
public class MenuCategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public MenuCategoriesController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(ApiResponse<object>.Ok(await _db.MenuCategories.Include(x => x.MenuItems).ToListAsync()));

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(MenuCategoryRequest request)
    {
        var category = new MenuCategory { CategoryName = request.CategoryName, Description = request.Description, IsActive = request.IsActive };
        _db.MenuCategories.Add(category);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<MenuCategory>.Ok(category, "Category created successfully"));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, MenuCategoryRequest request)
    {
        var category = await _db.MenuCategories.FindAsync(id);
        if (category is null) return NotFound(ApiResponse<object>.Fail("Category not found"));
        category.CategoryName = request.CategoryName;
        category.Description = request.Description;
        category.IsActive = request.IsActive;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<MenuCategory>.Ok(category, "Category updated successfully"));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await _db.MenuCategories.FindAsync(id);
        if (category is null) return NotFound(ApiResponse<object>.Fail("Category not found"));
        _db.MenuCategories.Remove(category);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(null, "Category deleted successfully"));
    }
}
