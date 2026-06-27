using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantManagement.Api.Data;
using RestaurantManagement.Api.DTOs;
using RestaurantManagement.Api.Models;

namespace RestaurantManagement.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/tables")]
public class TablesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public TablesController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool availableOnly = false)
    {
        var query = _db.RestaurantTables.AsQueryable();
        if (availableOnly) query = query.Where(x => x.Status == TableStatus.Available);
        return Ok(ApiResponse<object>.Ok(await query.OrderBy(x => x.TableNumber).ToListAsync()));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(TableRequest request)
    {
        var table = new RestaurantTable { TableNumber = request.TableNumber, Capacity = request.Capacity, Status = request.Status };
        _db.RestaurantTables.Add(table);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<RestaurantTable>.Ok(table, "Table created successfully"));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, TableRequest request)
    {
        var table = await _db.RestaurantTables.FindAsync(id);
        if (table is null) return NotFound(ApiResponse<object>.Fail("Table not found"));
        table.TableNumber = request.TableNumber;
        table.Capacity = request.Capacity;
        table.Status = request.Status;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<RestaurantTable>.Ok(table, "Table updated successfully"));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var table = await _db.RestaurantTables.FindAsync(id);
        if (table is null) return NotFound(ApiResponse<object>.Fail("Table not found"));
        _db.RestaurantTables.Remove(table);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(null, "Table deleted successfully"));
    }
}
